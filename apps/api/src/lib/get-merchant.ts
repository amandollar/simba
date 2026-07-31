import type { Request } from "express";
import type { AuthedRequest } from "./auth.js";

export function getMerchant(req: Request) {
  return (req as unknown as AuthedRequest).merchant;
}
