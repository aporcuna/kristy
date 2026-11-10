import type { AuctionToyStatus, Direction } from './types';

interface HasStatus {
  status: AuctionToyStatus;
}

/** A toy that can still be auctioned: New or On hold. */
export const isPending = (status: AuctionToyStatus): boolean =>
  status === 'New' || status === 'On hold';

/**
 * Index of the closest New / On hold toy before or after the active toy.
 * No wrap-around. Sold toys are skipped. Returns -1 when there is none.
 * When no toy is active, "next" searches from the start of the list.
 */
export function findAdjacentPendingIndex(
  toys: HasStatus[],
  direction: Direction,
): number {
  const activeIndex = toys.findIndex((t) => t.status === 'Active');
  const step = direction === 'next' ? 1 : -1;
  let i = activeIndex === -1 ? (direction === 'next' ? 0 : -1) : activeIndex + step;
  for (; i >= 0 && i < toys.length; i += step) {
    if (isPending(toys[i].status)) return i;
  }
  return -1;
}
