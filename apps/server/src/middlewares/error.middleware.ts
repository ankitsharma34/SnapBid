import type { Request, Response, NextFunction } from "express";

import { AuctionError, type AuctionErrorCode } from "@snapbid/auction";
import { Prisma } from "@snapbid/database";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error.js";

type ErrorDetails = Array<{
  field: string;
  message: string;
}>;

const sendError = (
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: ErrorDetails,
) => {
  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  });
};

const auctionErrorStatus: Record<AuctionErrorCode, number> = {
  AUCTION_NOT_FOUND: 404,
  INVALID_AUCTION_STATE: 409,
  AUCTION_NOT_STARTED: 409,
  AUCTION_ALREADY_ENDED: 409,
  AUCTION_ALREADY_LIVE: 409,
  INVALID_AUCTION_TIME: 409,
};

const prismaErrorResponse = (error: Prisma.PrismaClientKnownRequestError) => {
  switch (error.code) {
    case "P2002":
      return {
        status: 409,
        code: "RESOURCE_CONFLICT",
        message: "A resource with these details already exists",
      };
    case "P2003":
      return {
        status: 409,
        code: "RELATION_CONFLICT",
        message: "The operation conflicts with a related resource",
      };
    case "P2025":
      return {
        status: 404,
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found",
      };
    default:
      return null;
  }
};

export const errorMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof ZodError) {
    return sendError(
      res,
      400,
      "VALIDATION_ERROR",
      "Request validation failed",
      error.issues.map((issue) => ({
        field: issue.path.join(".") || "request",
        message: issue.message,
      })),
    );
  }

  if (error instanceof AppError) {
    return sendError(res, error.statusCode, error.code, error.message);
  }

  if (error instanceof AuctionError) {
    return sendError(
      res,
      auctionErrorStatus[error.code],
      error.code,
      error.message,
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const mappedError = prismaErrorResponse(error);

    if (mappedError) {
      return sendError(
        res,
        mappedError.status,
        mappedError.code,
        mappedError.message,
      );
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return sendError(
      res,
      400,
      "INVALID_DATABASE_INPUT",
      "The supplied data is invalid",
    );
  }

  req.log.error(
    {
      err: error,
      method: req.method,
      path: req.originalUrl,
    },
    "Unhandled request error",
  );

  return sendError(res, 500, "INTERNAL_SERVER_ERROR", "Internal server error");
};
