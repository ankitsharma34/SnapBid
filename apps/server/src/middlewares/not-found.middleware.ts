import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error.js";

export const notFoundMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(
    new AppError(
      `Route ${req.method} ${req.originalUrl} not found`,
      404,
      "ROUTE_NOT_FOUND",
    ),
  );
};
