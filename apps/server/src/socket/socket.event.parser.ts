import { z } from "zod";
import type { SocketEvent } from "./socket.events.js";

const identifierSchema = z.string().trim().min(1);
const amountSchema = z.string().regex(/^\d+(\.\d+)?$/);
const timestampSchema = z.iso.datetime({ offset: true });

const socketEventSchema = z.discriminatedUnion("event", [
  z
    .object({
      event: z.literal("auction:started"),
      payload: z
        .object({
          auctionId: identifierSchema,
          status: z.literal("LIVE"),
          startedAt: timestampSchema,
        })
        .strict(),
    })
    .strict(),
  z
    .object({
      event: z.literal("auction:ended"),
      payload: z
        .object({
          auctionId: identifierSchema,
          status: z.literal("ENDED"),
          winner: z
            .object({
              userId: identifierSchema,
              bidId: identifierSchema,
              amount: amountSchema,
            })
            .strict()
            .nullable(),
          endedAt: timestampSchema,
        })
        .strict(),
    })
    .strict(),
  z
    .object({
      event: z.literal("auction:bid"),
      payload: z
        .object({
          auctionId: identifierSchema,
          bid: z
            .object({
              id: identifierSchema,
              bidderId: identifierSchema,
              amount: amountSchema,
              createdAt: timestampSchema,
            })
            .strict(),
          currentPrice: amountSchema,
        })
        .strict(),
    })
    .strict(),
]);

export const parseSocketEvent = (message: string): SocketEvent => {
  const parsed: unknown = JSON.parse(message);
  return socketEventSchema.parse(parsed) as SocketEvent;
};
