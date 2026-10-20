import { randomUUID } from "node:crypto";
import { pinoHttp } from "pino-http";
import { logger } from "../config/logger.js";

export const REQUEST_ID_HEADER = "x-request-id";

const isValidRequestId = (value: unknown): value is string => {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 128 &&
    /^[A-Za-z0-9._:-]+$/.test(value)
  );
};

export const loggerMiddleware = pinoHttp({
  logger,

  genReqId(req, res) {
    const incomingRequestId = req.headers[REQUEST_ID_HEADER];
    const requestId = isValidRequestId(incomingRequestId)
      ? incomingRequestId
      : randomUUID();

    res.setHeader(REQUEST_ID_HEADER, requestId);
    return requestId;
  },

  customAttributeKeys: {
    reqId: "requestId",
  },

  customSuccessMessage(req, res) {
    return `${req.method} ${req.url} -> ${res.statusCode}`;
  },

  serializers: {
    req() {
      return undefined;
    },

    res() {
      return undefined;
    },
  },
});
