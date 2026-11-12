import crypto from 'node:crypto';
import {
  findAdjacentPendingIndex,
  selectToy as selectToyRule,
  type Auction,
  type AuctionToy,
  type Direction,
  type Toy,
} from '@kristy/shared';
import { HttpError } from '../core/httpError';

/** Builds a new auction; every toy starts as New at its start price. */
export function createAuction(name: string, toys: Toy[]): Auction {
  const trimmed = name.trim();
  if (!trimmed) throw new HttpError(400, 'Auction name is required');
  if (toys.length === 0) throw new HttpError(400, 'Select at least one toy');
  return {
    id: crypto.randomUUID(),
    name: trimmed,
    toys: toys.map<AuctionToy>((toy) => ({
      toyId: toy.id,
      status: 'New',
      nextBidPrice: toy.startPrice,
      salePrice: null,
      currentBidderId: null,
    })),
  };
}

/**
 * Makes `toyId` the active toy. The previous active toy goes On hold when it
 * has at least one bid (keeping its prices and bidder), otherwise back to New.
 */
export function setActiveToy(auction: Auction, toyId: string): Auction {
  const target = auction.toys.find((t) => t.toyId === toyId);
  if (!target) throw new HttpError(404, 'Toy is not part of the auction');
  if (target.status === 'Sold') throw new HttpError(409, 'A sold toy cannot be activated here');
  return selectToyRule(auction, toyId, target.nextBidPrice);
}

/**
 * Activates `toyId` from the auction list, including reopening a Sold toy and
 * resetting it to its catalogue start price.
 */
export function selectToy(auction: Auction, toyId: string, toys: Toy[]): Auction {
  const target = auction.toys.find((t) => t.toyId === toyId);
  if (!target) throw new HttpError(404, 'Toy is not part of the auction');
  const toy = toys.find((t) => t.id === toyId);
  if (!toy) throw new HttpError(404, 'Toy is not part of the catalogue');
  return selectToyRule(auction, toyId, toy.startPrice);
}

/** Previous / Next: moves to the closest New or On hold toy, skipping Sold ones. */
export function navigate(auction: Auction, direction: Direction): Auction {
  const index = findAdjacentPendingIndex(auction.toys, direction);
  if (index === -1) throw new HttpError(409, `There is no pending toy to go ${direction}`);
  return setActiveToy(auction, auction.toys[index].toyId);
}
