# PR Reality Check

**See what your PRs actually impact.** GitHub shows what changed — this tool shows the blast radius, hidden dependencies, missing tests, and real risk.

![PR Reality Check](./screenshot.png)

## What is this?

Developers often approve pull requests without fully understanding the real impact of the changes. GitHub shows file diffs, but it doesn't clearly show:

- **Blast radius** — what parts of the system might break?
- **Risk level** — how dangerous is this change?
- **Hidden dependencies** — what else depends on these files?
- **Missing test coverage** — are there tests for these changes?

**PR Reality Check** solves this by analyzing any GitHub pull request and giving you a clear picture of what's actually at stake.

## Features

- 🎯 **Blast Radius Analysis** — See which files and modules are affected
- ⚠️ **Risk Scoring** — Get an instant risk assessment (Low/Medium/High/Critical)
- 🧪 **Test Coverage Detection** — Identify source files without tests
- 🔗 **Dependency Visualization** — Interactive impact graph
- 📊 **Change Statistics** — Lines added/deleted, file counts
- 💡 **Actionable Recommendations** — Suggestions to reduce risk

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pr-reality-check.git

# Navigate to the project
cd pr-reality-check

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Usage

1. Paste any GitHub PR URL (e.g., `https://github.com/facebook/react/pull/12345`)
2. Click **Analyze**
3. View the risk analysis, impact graph, and file breakdown

For private repositories, add a GitHub token by clicking "Add GitHub token".

## How It Works

1. **URL Parsing** — Extracts owner, repo, and PR number from the URL
2. **API Fetching** — Retrieves PR metadata and changed files from GitHub
3. **File Analysis** — Categorizes files (source, test, config, etc.)
4. **Risk Calculation** — Scores each file based on:
   - File category and sensitivity patterns
   - Change size (additions/deletions)
   - Whether tests exist for the file
5. **Graph Building** — Creates an interactive visualization of file relationships
6. **Summary Generation** — Produces a plain-English risk summary with recommendations

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Graph:** @xyflow/react (React Flow)
- **API:** GitHub REST API

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main page component
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── PRInput.tsx       # URL input form
│   ├── RiskSummary.tsx   # Risk analysis panel
│   ├── RiskBadge.tsx     # Risk level indicators
│   ├── FileList.tsx      # Changed files list
│   ├── ImpactGraph.tsx   # Interactive graph
│   ├── Header.tsx        # App header
│   ├── LoadingState.tsx  # Loading indicator
│   └── ErrorState.tsx    # Error display
├── lib/
│   ├── github.ts         # GitHub API integration
│   └── risk-analyzer.ts  # Risk analysis logic
└── types/
    └── index.ts          # TypeScript types
```

## Privacy

- **No data storage** — All analysis happens in your browser
- **No backend** — Direct GitHub API calls
- **Token stays local** — GitHub tokens are never sent to any server

## Limitations

- Works best with public repositories (private repos need a token)
- GitHub API rate limits apply (60 req/hour unauthenticated, 5000 req/hour with token)
- Dependency detection is heuristic-based (not full AST parsing)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this in your own projects.

---

**Built for developers who want to review PRs with confidence.**
