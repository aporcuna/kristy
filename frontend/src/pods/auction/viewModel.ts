import type { AuctionToyDetail, AuctionToyStatus } from '@kristy/shared';

/** Display data for one toy in the auction's left panel. */
export interface AuctionToyListItem {
  toyId: string;
  name: string;
  photo: string | null;
  status: AuctionToyStatus;
}

/** Joins each auction toy (status) with its catalogue data (name, photo), in auction order. */
export function buildAuctionToyListItems(toys: AuctionToyDetail[]): AuctionToyListItem[] {
  return toys.map((lot) => ({
    toyId: lot.toyId,
    name: lot.toy.name,
    photo: lot.toy.photo,
    status: lot.status,
  }));
}
