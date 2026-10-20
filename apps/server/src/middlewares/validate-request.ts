import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ZodType } from "zod";

type ValidationSource = "body" | "params" | "query";

const validate = (
  source: ValidationSource,
  schema: ZodType,
): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      next(result.error);
      return;
    }

    req.validated ??= {};
    req.validated[source] = result.data;
    next();
  };
};

export const validateBody = (schema: ZodType) => validate("body", schema);
export const validateParams = (schema: ZodType) => validate("params", schema);
export const validateQuery = (schema: ZodType) => validate("query", schema);

const getValidated = <T>(req: Request, source: ValidationSource): T => {
  if (!req.validated || !(source in req.validated)) {
    throw new Error(
      `Validated ${source} is unavailable; register validation middleware before the controller`,
    );
  }

  return req.validated[source] as T;
};

export const getValidatedBody = <T>(req: Request) =>
  getValidated<T>(req, "body");

export const getValidatedParams = <T>(req: Request) =>
  getValidated<T>(req, "params");

export const getValidatedQuery = <T>(req: Request) =>
  getValidated<T>(req, "query");
