export type CreateAuctionRepositoryInput = {
  sellerId: string;
  title: string;
  description: string | null;
  startingPrice: number;
  currentPrice: number;
  bidIncrement: number;
  startTime: Date;
  endTime: Date;
  status: "SCHEDULED" | "LIVE";
  categoryId: string | null;
  auctionImages: string[];
};

export type UpdateAuctionRepositoryInput = {
  title: string;
  description: string | null;
  startingPrice: number;
  currentPrice: number;
  bidIncrement: number;
  startTime: Date;
  endTime: Date;
  categoryId: string | null;
  auctionImages: string[];
};
