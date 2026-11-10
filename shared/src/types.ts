export interface Toy {
  id: string;
  name: string;
  /** URL path of the uploaded photo, or null when there is none. */
  photo: string | null;
  description: string;
  model: string;
  /** Start price in euros. */
  startPrice: number;
}

export interface Bidder {
  id: string;
  name: string;
}

export type AuctionToyStatus = 'New' | 'Active' | 'On hold' | 'Sold';

/** A toy inside an auction (internally called a "lot"). */
export interface AuctionToy {
  toyId: string;
  status: AuctionToyStatus;
  /** Price the next bid will commit to (starts at the toy's start price). */
  nextBidPrice: number;
  /** Price committed by the current bidder (null until the first bid). */
  salePrice: number | null;
  /** Bidder holding the current bid (null until the first bid). */
  currentBidderId: string | null;
}

/** Single record: only the current auction exists. */
export interface Auction {
  id: string;
  name: string;
  toys: AuctionToy[];
}

export interface AuctionToyDetail extends AuctionToy {
  toy: Toy;
}

export interface AuctionDetail {
  id: string;
  name: string;
  toys: AuctionToyDetail[];
}

export interface CreateAuctionRequest {
  name: string;
  toyIds: string[];
}

export type Direction = 'previous' | 'next';
