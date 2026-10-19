import type { Role } from "@snapbid/database";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error.js";

export const authorizeRoles = (...allowedRoles: readonly Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new AppError("Authentication required", 401));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError("Insufficient permissions", 403));
      return;
    }

    next();
  };
};
