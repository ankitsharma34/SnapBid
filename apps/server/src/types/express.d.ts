import type { Role } from "@snapbid/database";

declare global {
  namespace Express {
    interface Request {
      validated?: {
        body?: unknown;
        params?: unknown;
        query?: unknown;
      };
      user?: {
        userId: string;
        role: Role;
      };
    }
  }
}

export {};
