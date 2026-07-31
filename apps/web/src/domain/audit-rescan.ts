export function rescanReasonLabel(reason?: string) {
  switch (reason) {
    case "fix-applied":
      return "your recent fix";
    case "product-updated":
      return "product changes";
    case "product-created":
      return "a new product";
    case "product-deleted":
      return "catalog changes";
    case "store-launched":
      return "launching your store";
    case "store-details-updated":
      return "store details changes";
    default:
      return "recent changes";
  }
}
