export type AuctionErrorCode =
  | "AUCTION_NOT_FOUND"
  | "INVALID_AUCTION_STATE"
  | "AUCTION_NOT_STARTED"
  | "AUCTION_ALREADY_ENDED"
  | "AUCTION_ALREADY_LIVE"
  | "INVALID_AUCTION_TIME";

export class AuctionError extends Error {
  constructor(
    message: string,
    public readonly code: AuctionErrorCode,
  ) {
    super(message);
    this.name = "AuctionError";

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
