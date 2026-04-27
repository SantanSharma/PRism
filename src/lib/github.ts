import { PRInfo, ChangedFile, ParsedPRUrl, AnalysisError } from "@/types";

const GITHUB_API_BASE = "https://api.github.com";

/**
 * Parse a GitHub PR URL to extract owner, repo, and PR number
 */
export function parsePRUrl(url: string): ParsedPRUrl | null {
  // Match patterns like:
  // https://github.com/owner/repo/pull/123
  // github.com/owner/repo/pull/123
  // owner/repo#123
  const patterns = [
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/i,
    /^github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/i,
    /^([^/]+)\/([^/#]+)#(\d+)$/,
  ];

  for (const pattern of patterns) {
    const match = url.trim().match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2],
        number: parseInt(match[3], 10),
      };
    }
  }

  return null;
}

/**
 * Build headers for GitHub API requests
 */
function buildHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Handle GitHub API errors
 */
function handleApiError(status: number, message?: string): AnalysisError {
  switch (status) {
    case 404:
      return {
        type: "not-found",
        message: "Pull request not found",
        details: "The PR may be private, deleted, or the URL is incorrect.",
      };
    case 403:
      return {
        type: "rate-limited",
        message: "GitHub API rate limit exceeded",
        details: "You can add a GitHub token to increase the rate limit.",
      };
    case 401:
      return {
        type: "api-error",
        message: "Authentication failed",
        details: "Please check your GitHub token.",
      };
    default:
      return {
        type: "api-error",
        message: message || "Failed to fetch PR data",
        details: `HTTP ${status}`,
      };
  }
}

/**
 * Fetch PR metadata from GitHub API
 */
export async function fetchPRInfo(
  owner: string,
  repo: string,
  prNumber: number,
  token?: string,
): Promise<{ data?: PRInfo; error?: AnalysisError }> {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${prNumber}`,
      { headers: buildHeaders(token) },
    );

    if (!response.ok) {
      return { error: handleApiError(response.status) };
    }

    const data = await response.json();

    return {
      data: {
        owner,
        repo,
        number: prNumber,
        title: data.title,
        author: data.user?.login || "unknown",
        state: data.state,
        additions: data.additions,
        deletions: data.deletions,
        changedFiles: data.changed_files,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        baseBranch: data.base?.ref || "unknown",
        headBranch: data.head?.ref || "unknown",
        htmlUrl: data.html_url,
        body: data.body,
      },
    };
  } catch (err) {
    return {
      error: {
        type: "unknown",
        message: "Failed to fetch PR information",
        details: err instanceof Error ? err.message : "Network error",
      },
    };
  }
}

/**
 * Fetch changed files in a PR
 */
export async function fetchPRFiles(
  owner: string,
  repo: string,
  prNumber: number,
  token?: string,
): Promise<{ data?: ChangedFile[]; error?: AnalysisError }> {
  try {
    const files: ChangedFile[] = [];
    let page = 1;
    const perPage = 100;

    // Paginate through all files (PRs can have many files)
    while (true) {
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${prNumber}/files?per_page=${perPage}&page=${page}`,
        { headers: buildHeaders(token) },
      );

      if (!response.ok) {
        return { error: handleApiError(response.status) };
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        break;
      }

      for (const file of data) {
        files.push({
          filename: file.filename,
          status: file.status as ChangedFile["status"],
          additions: file.additions,
          deletions: file.deletions,
          changes: file.changes,
          patch: file.patch,
          previousFilename: file.previous_filename,
        });
      }

      if (data.length < perPage) {
        break;
      }

      page++;
    }

    return { data: files };
  } catch (err) {
    return {
      error: {
        type: "unknown",
        message: "Failed to fetch PR files",
        details: err instanceof Error ? err.message : "Network error",
      },
    };
  }
}

/**
 * Fetch repository file tree (for dependency analysis)
 */
export async function fetchRepoTree(
  owner: string,
  repo: string,
  branch: string,
  token?: string,
): Promise<{ data?: string[]; error?: AnalysisError }> {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      { headers: buildHeaders(token) },
    );

    if (!response.ok) {
      // Non-critical, return empty array
      return { data: [] };
    }

    const data = await response.json();
    const files = (data.tree || [])
      .filter((item: { type: string }) => item.type === "blob")
      .map((item: { path: string }) => item.path);

    return { data: files };
  } catch {
    // Non-critical error, return empty
    return { data: [] };
  }
}

/**
 * Fetch file content for import analysis
 */
export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  ref: string,
  token?: string,
): Promise<string | null> {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}?ref=${ref}`,
      { headers: buildHeaders(token) },
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.encoding === "base64" && data.content) {
      return atob(data.content.replace(/\n/g, ""));
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch commit authors for code ownership analysis
 */
export async function fetchFileCommits(
  owner: string,
  repo: string,
  path: string,
  token?: string,
): Promise<string[]> {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?path=${encodeURIComponent(path)}&per_page=10`,
      { headers: buildHeaders(token) },
    );

    if (!response.ok) {
      return [];
    }

    const commits = await response.json();
    const authors = new Set<string>();

    for (const commit of commits) {
      if (commit.author?.login) {
        authors.add(commit.author.login);
      }
    }

    return Array.from(authors);
  } catch {
    return [];
  }
}
