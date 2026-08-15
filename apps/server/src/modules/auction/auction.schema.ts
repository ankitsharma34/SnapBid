import { z } from "zod";
export const auctionIdParamsSchema = z.object({
  id: z.cuid2(),
});
