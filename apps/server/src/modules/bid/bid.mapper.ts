type BidResponseInput = {
  id: string;
  bidderId: string;
  amount: { toString(): string };
  createdAt: Date;
};

export const toBidResponse = (bid: BidResponseInput) => ({
  bidId: bid.id,
  bidderId: bid.bidderId,
  amount: bid.amount.toString(),
  createdAt: bid.createdAt.toISOString(),
});
