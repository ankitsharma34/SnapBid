import { Prisma } from "../../../generated/prisma/client.js";
import { AppError } from "../../utils/app-error.js";
import { placeBid } from "./bid.repository.js";

export const postBidService = async ({
  auctionId,
  bidderId,
  inputAmount,
}: {
  auctionId: string;
  bidderId: string;
  inputAmount: string;
}) => {
  const bid = await placeBid({
    auctionId,
    bidderId,
    inputAmount,
  });

  return bid.id;
};
