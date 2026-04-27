import {
  ChangedFile,
  FileAnalysis,
  FileCategory,
  RiskLevel,
  RiskScore,
  RiskFactor,
  PRInfo,
  PRAnalysis,
  ImpactNode,
  ImpactEdge,
} from "@/types";

/**
 * File patterns and their categories
 */
const FILE_PATTERNS: { pattern: RegExp; category: FileCategory }[] = [
  // Test files
  { pattern: /\.(test|spec)\.(ts|tsx|js|jsx)$/i, category: "test" },
  { pattern: /\/__tests__\//i, category: "test" },
  { pattern: /\.test\.py$/i, category: "test" },
  { pattern: /_test\.go$/i, category: "test" },
  { pattern: /Test\.java$/i, category: "test" },
  { pattern: /\.spec\.rb$/i, category: "test" },

  // Config files
  { pattern: /\.(json|yaml|yml|toml|ini|conf|config)$/i, category: "config" },
  { pattern: /\.(env|env\..*)/i, category: "config" },
  { pattern: /Dockerfile$/i, category: "infrastructure" },
  { pattern: /docker-compose/i, category: "infrastructure" },
  { pattern: /\.github\//i, category: "infrastructure" },
  { pattern: /Makefile$/i, category: "infrastructure" },
  { pattern: /webpack|rollup|vite|babel|eslint|prettier/i, category: "config" },

  // Documentation
  { pattern: /\.(md|mdx|rst|txt|doc|docx)$/i, category: "documentation" },
  { pattern: /README/i, category: "documentation" },
  { pattern: /CHANGELOG/i, category: "documentation" },
  { pattern: /LICENSE/i, category: "documentation" },

  // Assets
  { pattern: /\.(png|jpg|jpeg|gif|svg|ico|webp|bmp)$/i, category: "asset" },
  { pattern: /\.(mp3|mp4|wav|avi|mov|webm)$/i, category: "asset" },
  { pattern: /\.(woff|woff2|ttf|eot|otf)$/i, category: "asset" },
  { pattern: /\.(css|scss|sass|less|styl)$/i, category: "asset" },

  // Dependencies
  { pattern: /package(-lock)?\.json$/i, category: "dependency" },
  { pattern: /yarn\.lock$/i, category: "dependency" },
  { pattern: /pnpm-lock\.yaml$/i, category: "dependency" },
  { pattern: /Gemfile(\.lock)?$/i, category: "dependency" },
  { pattern: /requirements\.txt$/i, category: "dependency" },
  { pattern: /go\.(mod|sum)$/i, category: "dependency" },
  { pattern: /Cargo\.(toml|lock)$/i, category: "dependency" },
  { pattern: /pom\.xml$/i, category: "dependency" },
  { pattern: /\.csproj$/i, category: "dependency" },

  // Migrations
  { pattern: /migrations?\//i, category: "migration" },
  { pattern: /\d{8,14}.*\.(sql|rb|py)$/i, category: "migration" },

  // Source files (catch-all for code)
  {
    pattern:
      /\.(ts|tsx|js|jsx|py|rb|go|java|kt|swift|rs|cpp|c|h|cs|php|scala)$/i,
    category: "source",
  },
];

/**
 * Sensitive file patterns that increase risk
 */
const SENSITIVE_PATTERNS = [
  { pattern: /auth|login|password|credential|secret|token|key/i, weight: 3 },
  { pattern: /payment|billing|checkout|stripe|paypal/i, weight: 4 },
  { pattern: /admin|security|permission|role|access/i, weight: 3 },
  { pattern: /database|migration|schema/i, weight: 3 },
  { pattern: /config|env|setting/i, weight: 2 },
  { pattern: /api\/|routes?\/|controller|handler/i, weight: 2 },
  { pattern: /core|critical|important/i, weight: 2 },
  { pattern: /utils?|helper|lib|shared/i, weight: 2 },
];

/**
 * Determine file category based on filename
 */
export function categorizeFile(filename: string): FileCategory {
  for (const { pattern, category } of FILE_PATTERNS) {
    if (pattern.test(filename)) {
      return category;
    }
  }
  return "unknown";
}

/**
 * Extract imports from file content (simplified)
 */
export function extractImports(content: string, filename: string): string[] {
  const imports: string[] = [];
  const ext = filename.split(".").pop()?.toLowerCase();

  if (["ts", "tsx", "js", "jsx"].includes(ext || "")) {
    // ES6 imports
    const importMatches = content.matchAll(/import\s+.*?from\s+['"](.+?)['"]/g);
    for (const match of importMatches) {
      imports.push(match[1]);
    }

    // require() calls
    const requireMatches = content.matchAll(
      /require\s*\(\s*['"](.+?)['"]\s*\)/g,
    );
    for (const match of requireMatches) {
      imports.push(match[1]);
    }
  } else if (ext === "py") {
    // Python imports
    const fromImports = content.matchAll(/from\s+(\S+)\s+import/g);
    for (const match of fromImports) {
      imports.push(match[1]);
    }
    const directImports = content.matchAll(/^import\s+(\S+)/gm);
    for (const match of directImports) {
      imports.push(match[1]);
    }
  } else if (ext === "go") {
    // Go imports
    const goImports = content.matchAll(/import\s+(?:\(\s*)?["'](.+?)["']/g);
    for (const match of goImports) {
      imports.push(match[1]);
    }
  }

  return imports;
}

/**
 * Find the corresponding test file for a source file
 */
export function findTestFile(
  sourceFile: string,
  allFiles: string[],
): string | undefined {
  const baseName = sourceFile.replace(/\.(ts|tsx|js|jsx|py|rb|go|java)$/, "");
  const dir = sourceFile.includes("/")
    ? sourceFile.substring(0, sourceFile.lastIndexOf("/"))
    : "";

  const testPatterns = [
    `${baseName}.test.ts`,
    `${baseName}.test.tsx`,
    `${baseName}.test.js`,
    `${baseName}.test.jsx`,
    `${baseName}.spec.ts`,
    `${baseName}.spec.tsx`,
    `${baseName}.spec.js`,
    `${baseName}.spec.jsx`,
    `${dir}/__tests__/${sourceFile.split("/").pop()}`,
    `test_${sourceFile.split("/").pop()}`,
    `${baseName}_test.go`,
    `${baseName}Test.java`,
  ];

  for (const pattern of testPatterns) {
    const found = allFiles.find(
      (f) => f === pattern || f.endsWith(pattern.split("/").pop() || ""),
    );
    if (found) return found;
  }

  return undefined;
}

/**
 * Calculate risk level for a file
 */
export function calculateFileRisk(
  file: ChangedFile,
  category: FileCategory,
): { level: RiskLevel; factors: string[] } {
  const factors: string[] = [];
  let score = 0;

  // Base risk by category
  const categoryRisk: Record<FileCategory, number> = {
    source: 20,
    test: 5,
    config: 30,
    documentation: 5,
    asset: 5,
    dependency: 40,
    infrastructure: 35,
    migration: 50,
    unknown: 15,
  };

  score += categoryRisk[category];
  if (categoryRisk[category] >= 30) {
    factors.push(`${category} file type`);
  }

  // Check for sensitive patterns
  for (const { pattern, weight } of SENSITIVE_PATTERNS) {
    if (pattern.test(file.filename)) {
      score += weight * 5;
      factors.push(`Sensitive: ${file.filename.match(pattern)?.[0]}`);
      break; // Only count once
    }
  }

  // Size-based risk
  if (file.changes > 500) {
    score += 25;
    factors.push(`Large change (${file.changes} lines)`);
  } else if (file.changes > 200) {
    score += 15;
    factors.push(`Significant change (${file.changes} lines)`);
  } else if (file.changes > 100) {
    score += 8;
  }

  // Deletion risk (removing code can break things)
  if (file.deletions > file.additions && file.deletions > 50) {
    score += 10;
    factors.push(`Heavy deletions (${file.deletions} lines removed)`);
  }

  // File status risk
  if (file.status === "removed") {
    score += 15;
    factors.push("File deleted");
  } else if (file.status === "renamed") {
    score += 10;
    factors.push("File renamed");
  }

  // Determine level
  let level: RiskLevel;
  if (score >= 60) {
    level = "critical";
  } else if (score >= 40) {
    level = "high";
  } else if (score >= 20) {
    level = "medium";
  } else {
    level = "low";
  }

  return { level, factors };
}

/**
 * Analyze a single file
 */
export function analyzeFile(
  file: ChangedFile,
  allFiles: string[],
  changedFiles: ChangedFile[],
): FileAnalysis {
  const category = categorizeFile(file.filename);
  const { level: riskLevel, factors: riskFactors } = calculateFileRisk(
    file,
    category,
  );

  // Check if this is a test file or if tests exist for this file
  const isTestFile = category === "test";
  let hasTests = isTestFile;
  let relatedTestFile: string | undefined;

  if (!isTestFile && category === "source") {
    // Look for test file in changed files first
    const changedFilenames = changedFiles.map((f) => f.filename);
    relatedTestFile = findTestFile(file.filename, changedFilenames);

    if (!relatedTestFile) {
      // Look in repo tree
      relatedTestFile = findTestFile(file.filename, allFiles);
    }

    hasTests = !!relatedTestFile;
  }

  // Find potential dependencies (files in same directory or imported by this file)
  const dir = file.filename.includes("/")
    ? file.filename.substring(0, file.filename.lastIndexOf("/"))
    : "";

  const dependencies = allFiles
    .filter((f) => {
      if (f === file.filename) return false;
      const fDir = f.includes("/") ? f.substring(0, f.lastIndexOf("/")) : "";
      return fDir === dir && categorizeFile(f) === "source";
    })
    .slice(0, 5); // Limit to avoid noise

  // Find potential dependents (files that might import this file)
  const baseName = file.filename
    .split("/")
    .pop()
    ?.replace(/\.[^.]+$/, "");
  const dependents = allFiles
    .filter((f) => {
      if (f === file.filename) return false;
      return categorizeFile(f) === "source" && f !== file.filename;
    })
    .filter((f) => {
      // Simple heuristic: might be dependent if in parent directory
      const fDir = f.includes("/") ? f.substring(0, f.lastIndexOf("/")) : "";
      return dir.startsWith(fDir) || fDir.includes(baseName || "");
    })
    .slice(0, 5);

  return {
    ...file,
    category,
    riskLevel,
    riskFactors,
    hasTests,
    relatedTestFile,
    dependencies,
    dependents,
    codeOwners: [], // Will be populated separately if needed
  };
}

/**
 * Calculate overall PR risk score
 */
export function calculatePRRisk(pr: PRInfo, files: FileAnalysis[]): RiskScore {
  const factors: RiskFactor[] = [];
  let totalScore = 0;

  // 1. Size factor
  const totalChanges = pr.additions + pr.deletions;
  if (totalChanges > 1000) {
    factors.push({
      name: "Large PR",
      description: `${totalChanges} total lines changed`,
      impact: 8,
      category: "complexity",
    });
    totalScore += 25;
  } else if (totalChanges > 500) {
    factors.push({
      name: "Medium-large PR",
      description: `${totalChanges} total lines changed`,
      impact: 5,
      category: "complexity",
    });
    totalScore += 15;
  } else if (totalChanges > 200) {
    totalScore += 8;
  }

  // 2. File count factor
  if (pr.changedFiles > 20) {
    factors.push({
      name: "Many files changed",
      description: `${pr.changedFiles} files modified`,
      impact: 7,
      category: "blast-radius",
    });
    totalScore += 20;
  } else if (pr.changedFiles > 10) {
    factors.push({
      name: "Multiple files changed",
      description: `${pr.changedFiles} files modified`,
      impact: 4,
      category: "blast-radius",
    });
    totalScore += 10;
  }

  // 3. High-risk files factor
  const criticalFiles = files.filter((f) => f.riskLevel === "critical");
  const highRiskFiles = files.filter((f) => f.riskLevel === "high");

  if (criticalFiles.length > 0) {
    factors.push({
      name: "Critical files modified",
      description: `${criticalFiles.length} critical file(s): ${criticalFiles.map((f) => f.filename.split("/").pop()).join(", ")}`,
      impact: 9,
      category: "sensitive",
    });
    totalScore += criticalFiles.length * 15;
  }

  if (highRiskFiles.length > 0) {
    factors.push({
      name: "High-risk files modified",
      description: `${highRiskFiles.length} high-risk file(s)`,
      impact: 6,
      category: "sensitive",
    });
    totalScore += highRiskFiles.length * 8;
  }

  // 4. Test coverage factor
  const sourceFiles = files.filter((f) => f.category === "source");
  const sourceWithoutTests = sourceFiles.filter((f) => !f.hasTests);
  const testCoverageRatio =
    sourceFiles.length > 0
      ? (sourceFiles.length - sourceWithoutTests.length) / sourceFiles.length
      : 1;

  if (sourceWithoutTests.length > 0 && testCoverageRatio < 0.5) {
    factors.push({
      name: "Low test coverage",
      description: `${sourceWithoutTests.length} of ${sourceFiles.length} source files lack tests`,
      impact: 7,
      category: "coverage",
    });
    totalScore += 20;
  } else if (sourceWithoutTests.length > 0) {
    factors.push({
      name: "Some files lack tests",
      description: `${sourceWithoutTests.length} source file(s) without tests`,
      impact: 4,
      category: "coverage",
    });
    totalScore += 10;
  }

  // 5. Config/Infrastructure changes
  const configFiles = files.filter(
    (f) => f.category === "config" || f.category === "infrastructure",
  );
  if (configFiles.length > 0) {
    factors.push({
      name: "Configuration changes",
      description: `${configFiles.length} config/infrastructure file(s) modified`,
      impact: 5,
      category: "sensitive",
    });
    totalScore += configFiles.length * 5;
  }

  // 6. Dependency changes
  const depFiles = files.filter((f) => f.category === "dependency");
  if (depFiles.length > 0) {
    factors.push({
      name: "Dependency changes",
      description: `Package dependencies modified`,
      impact: 6,
      category: "dependencies",
    });
    totalScore += 15;
  }

  // 7. Migration changes
  const migrationFiles = files.filter((f) => f.category === "migration");
  if (migrationFiles.length > 0) {
    factors.push({
      name: "Database migrations",
      description: `${migrationFiles.length} migration file(s)`,
      impact: 8,
      category: "sensitive",
    });
    totalScore += 20;
  }

  // Normalize score to 0-100
  const normalizedScore = Math.min(100, totalScore);

  // Determine level
  let level: RiskLevel;
  if (normalizedScore >= 70) {
    level = "critical";
  } else if (normalizedScore >= 45) {
    level = "high";
  } else if (normalizedScore >= 25) {
    level = "medium";
  } else {
    level = "low";
  }

  // Generate summary
  const summary = generateRiskSummary(level, factors, files, pr);

  // Generate recommendations
  const recommendations = generateRecommendations(factors, files);

  return {
    level,
    score: normalizedScore,
    factors,
    summary,
    recommendations,
  };
}

/**
 * Generate human-readable risk summary
 */
function generateRiskSummary(
  level: RiskLevel,
  factors: RiskFactor[],
  files: FileAnalysis[],
  pr: PRInfo,
): string {
  const parts: string[] = [];

  // Opening based on risk level
  const openings: Record<RiskLevel, string> = {
    low: "This PR appears to be low-risk.",
    medium: "This PR has moderate risk factors to consider.",
    high: "This PR requires careful review due to multiple risk factors.",
    critical: "This PR is high-risk and needs thorough review before merging.",
  };
  parts.push(openings[level]);

  // Key points
  const sourceFiles = files.filter((f) => f.category === "source").length;
  const testFiles = files.filter((f) => f.category === "test").length;

  parts.push(
    `It modifies ${pr.changedFiles} files (${sourceFiles} source, ${testFiles} test) with ${pr.additions} additions and ${pr.deletions} deletions.`,
  );

  // Top factors
  const topFactors = factors.slice(0, 3);
  if (topFactors.length > 0) {
    parts.push(
      `Key concerns: ${topFactors.map((f) => f.name.toLowerCase()).join(", ")}.`,
    );
  }

  return parts.join(" ");
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(
  factors: RiskFactor[],
  files: FileAnalysis[],
): string[] {
  const recommendations: string[] = [];

  // Based on factors
  for (const factor of factors) {
    if (factor.category === "coverage" && factor.impact >= 5) {
      recommendations.push(
        "Add tests for modified source files before merging.",
      );
    }
    if (factor.category === "complexity" && factor.impact >= 7) {
      recommendations.push(
        "Consider breaking this PR into smaller, focused changes.",
      );
    }
    if (factor.category === "sensitive" && factor.impact >= 7) {
      recommendations.push(
        "Request review from domain experts for sensitive file changes.",
      );
    }
    if (factor.category === "dependencies") {
      recommendations.push(
        "Verify dependency changes don't introduce vulnerabilities.",
      );
    }
  }

  // Based on files
  const criticalFiles = files.filter((f) => f.riskLevel === "critical");
  if (criticalFiles.length > 0) {
    recommendations.push(
      `Pay extra attention to critical files: ${criticalFiles.map((f) => f.filename.split("/").pop()).join(", ")}`,
    );
  }

  // Limit recommendations
  return [...new Set(recommendations)].slice(0, 5);
}

/**
 * Build impact graph from file analysis
 */
export function buildImpactGraph(files: FileAnalysis[]): {
  nodes: ImpactNode[];
  edges: ImpactEdge[];
} {
  const nodes: ImpactNode[] = [];
  const edges: ImpactEdge[] = [];
  const addedNodes = new Set<string>();

  // Add changed files as nodes
  for (const file of files) {
    const nodeId = file.filename;
    if (!addedNodes.has(nodeId)) {
      nodes.push({
        id: nodeId,
        type:
          file.category === "test"
            ? "test"
            : file.category === "config"
              ? "config"
              : "changed",
        label: file.filename.split("/").pop() || file.filename,
        riskLevel: file.riskLevel,
        data: file,
      });
      addedNodes.add(nodeId);
    }
  }

  // Add edges for dependencies
  for (const file of files) {
    // Add edges for dependencies
    for (const dep of file.dependencies) {
      if (!addedNodes.has(dep)) {
        const depFile = files.find((f) => f.filename === dep);
        nodes.push({
          id: dep,
          type: "affected",
          label: dep.split("/").pop() || dep,
          riskLevel: depFile?.riskLevel || "low",
          data: depFile || {
            filename: dep,
            status: "unchanged" as const,
            additions: 0,
            deletions: 0,
            changes: 0,
            category: categorizeFile(dep),
            riskLevel: "low" as const,
            riskFactors: [],
            hasTests: false,
            dependencies: [],
            dependents: [],
            codeOwners: [],
          },
        });
        addedNodes.add(dep);
      }

      edges.push({
        id: `${file.filename}->${dep}`,
        source: file.filename,
        target: dep,
        type: "imports",
      });
    }

    // Add edges for test files
    if (file.relatedTestFile && addedNodes.has(file.relatedTestFile)) {
      edges.push({
        id: `${file.relatedTestFile}->${file.filename}`,
        source: file.relatedTestFile,
        target: file.filename,
        type: "tests",
      });
    }
  }

  return { nodes, edges };
}

/**
 * Main analysis function
 */
export function performAnalysis(
  pr: PRInfo,
  changedFiles: ChangedFile[],
  repoFiles: string[] = [],
): PRAnalysis {
  // Analyze each file
  const allKnownFiles = [
    ...new Set([...repoFiles, ...changedFiles.map((f) => f.filename)]),
  ];
  const files = changedFiles.map((f) =>
    analyzeFile(f, allKnownFiles, changedFiles),
  );

  // Calculate risk score
  const riskScore = calculatePRRisk(pr, files);

  // Build impact graph
  const impactGraph = buildImpactGraph(files);

  // Calculate test coverage stats
  const sourceFiles = files.filter((f) => f.category === "source");
  const testCoverage = {
    hasTests: sourceFiles.filter((f) => f.hasTests).length,
    missingTests: sourceFiles.filter((f) => !f.hasTests).length,
    testFiles: files
      .filter((f) => f.category === "test")
      .map((f) => f.filename),
  };

  // Calculate stats
  const stats = {
    totalFiles: files.length,
    sourceFiles: files.filter((f) => f.category === "source").length,
    testFiles: files.filter((f) => f.category === "test").length,
    configFiles: files.filter(
      (f) => f.category === "config" || f.category === "infrastructure",
    ).length,
    avgChangesPerFile: Math.round(
      files.reduce((sum, f) => sum + f.changes, 0) / files.length,
    ),
    largestFile:
      files.reduce((max, f) => (f.changes > max.changes ? f : max), files[0])
        ?.filename || "",
    mostRiskyFile:
      files.reduce((max, f) => {
        const riskOrder: Record<RiskLevel, number> = {
          low: 0,
          medium: 1,
          high: 2,
          critical: 3,
        };
        return riskOrder[f.riskLevel] > riskOrder[max.riskLevel] ? f : max;
      }, files[0])?.filename || "",
  };

  return {
    pr,
    files,
    riskScore,
    impactGraph,
    testCoverage,
    stats,
  };
}
