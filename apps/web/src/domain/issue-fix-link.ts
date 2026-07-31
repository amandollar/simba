export function buildIssueFixHref(issueId: string, autofix = true) {
  const params = new URLSearchParams({ issue: issueId });
  if (autofix) params.set("autofix", "1");
  return `/simba/issues?${params.toString()}`;
}
