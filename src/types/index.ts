// Core PR types
export interface PRInfo {
  owner: string;
  repo: string;
  number: number;
  title: string;
  author: string;
  state: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  createdAt: string;
  updatedAt: string;
  baseBranch: string;
  headBranch: string;
  htmlUrl: string;
  body: string | null;
}

export interface ChangedFile {
  filename: string;
  status:
    | "added"
    | "removed"
    | "modified"
    | "renamed"
    | "copied"
    | "changed"
    | "unchanged";
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  previousFilename?: string;
}

export interface FileAnalysis extends ChangedFile {
  category: FileCategory;
  riskLevel: RiskLevel;
  riskFactors: string[];
  hasTests: boolean;
  relatedTestFile?: string;
  dependencies: string[];
  dependents: string[];
  codeOwners: string[];
}

export type FileCategory =
  | "source"
  | "test"
  | "config"
  | "documentation"
  | "asset"
  | "dependency"
  | "infrastructure"
  | "migration"
  | "unknown";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface RiskScore {
  level: RiskLevel;
  score: number; // 0-100
  factors: RiskFactor[];
  summary: string;
  recommendations: string[];
}

export interface RiskFactor {
  name: string;
  description: string;
  impact: number; // 1-10
  category:
    | "complexity"
    | "coverage"
    | "blast-radius"
    | "sensitive"
    | "dependencies";
}

export interface ImpactNode {
  id: string;
  type: "changed" | "affected" | "test" | "config";
  label: string;
  riskLevel: RiskLevel;
  data: FileAnalysis;
}

export interface ImpactEdge {
  id: string;
  source: string;
  target: string;
  type: "imports" | "imported-by" | "tests" | "configures";
}

export interface PRAnalysis {
  pr: PRInfo;
  files: FileAnalysis[];
  riskScore: RiskScore;
  impactGraph: {
    nodes: ImpactNode[];
    edges: ImpactEdge[];
  };
  testCoverage: {
    hasTests: number;
    missingTests: number;
    testFiles: string[];
  };
  stats: {
    totalFiles: number;
    sourceFiles: number;
    testFiles: number;
    configFiles: number;
    avgChangesPerFile: number;
    largestFile: string;
    mostRiskyFile: string;
  };
}

export interface ParsedPRUrl {
  owner: string;
  repo: string;
  number: number;
}

export interface AnalysisError {
  type: "invalid-url" | "not-found" | "rate-limited" | "api-error" | "unknown";
  message: string;
  details?: string;
}

export interface APIError {
  type: "invalid-url" | "not-found" | "rate-limited" | "api-error" | "unknown";
  message: string;
  details?: string;
}

export type AnalysisState =
  | { status: "idle" }
  | { status: "loading"; message: string }
  | { status: "success"; data: PRAnalysis }
  | { status: "error"; error: AnalysisError };
