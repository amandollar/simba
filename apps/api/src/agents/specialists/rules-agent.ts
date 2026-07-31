import { detectCatalogIssues } from "../../lib/catalog-rules.js";
import { finalizeIssues } from "../../lib/issue-quality.js";
import type { IssueDraft } from "../../lib/scoring.js";
import type { StoreSnapshot } from "../../lib/store-snapshot.js";
import { detectOperationalIssues } from "../operational-issues.js";

export function runRulesAgent(store: StoreSnapshot): IssueDraft[] {
  return finalizeIssues([
    ...detectOperationalIssues(store),
    ...detectCatalogIssues(store),
  ]);
}
