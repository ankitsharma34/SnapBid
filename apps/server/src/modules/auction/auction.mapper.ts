import {
  AuctionListQueryResult,
  AuctionQueryResult,
} from "./auction.repository.js";

export const toAuctionsListResponse = (auctions: AuctionListQueryResult) => {
  return auctions.map((auction) => ({
    id: auction.id,
    title: auction.title,
    currentPrice: auction.currentPrice.toString(),
    bidIncrement: auction.bidIncrement.toString(),
    startTime: auction.startTime,
    endTime: auction.endTime,
    status: auction.status,
    thumbnailUrl: auction.auctionImages[0]?.url ?? null,
  }));
};

export const toAuctionResponse = (auction: AuctionQueryResult) => {
  return {
    id: auction.id,
    title: auction.title,
    description: auction.description,
    startingPrice: auction.startingPrice.toString(),
    currentPrice: auction.currentPrice.toString(),
    bidIncrement: auction.bidIncrement.toString(),
    startTime: auction.startTime,
    endTime: auction.endTime,
    status: auction.status,
    images: auction.auctionImages.map((image) => image.url),
    category: auction.category
      ? {
          name: auction.category.name,
          slug: auction.category.slug,
        }
      : null,
    seller: {
      id: auction.seller.id,
      username: auction.seller.username,
      displayName: auction.seller.displayName,
      avatarUrl: auction.seller.avatarUrl,
    },
  };
};
