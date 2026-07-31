export function isStoreLaunched(launchedAt: Date | null | undefined) {
  return launchedAt != null;
}

export const NOT_LAUNCHED_ERROR = {
  error: "This store is not open yet",
  code: "NOT_LAUNCHED",
} as const;
