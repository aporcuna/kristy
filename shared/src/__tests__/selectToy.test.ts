import { describe, expect, it } from 'vitest';
import type { Auction, AuctionToyStatus } from '../types';
import { selectToy } from '../auctionRules';

const auctionWith = (statuses: Record<string, AuctionToyStatus>, bids: string[] = []): Auction => ({
  id: 'a',
  name: 'Test',
  toys: Object.entries(statuses).map(([toyId, status]) => ({
    toyId,
    status,
    nextBidPrice: bids.includes(toyId) ? 70 : 50,
    salePrice: bids.includes(toyId) ? 60 : null,
    currentBidderId: bids.includes(toyId) ? 'tony' : null,
  })),
});

const statusOf = (a: Auction) => Object.fromEntries(a.toys.map((t) => [t.toyId, t.status]));

describe('selectToy', () => {
  it('activates a New toy', () => {
    const next = selectToy(auctionWith({ A: 'New', B: 'New' }), 'A', 50);
    expect(statusOf(next)).toEqual({ A: 'Active', B: 'New' });
  });

  it('puts the previous toy with bids On hold keeping its price and bidder', () => {
    const next = selectToy(auctionWith({ A: 'Active', B: 'New' }, ['A']), 'B', 50);
    expect(statusOf(next)).toEqual({ A: 'On hold', B: 'Active' });
    expect(next.toys[0]).toMatchObject({ nextBidPrice: 70, salePrice: 60, currentBidderId: 'tony' });
  });

  it('sends the previous toy without bids back to New', () => {
    const next = selectToy(auctionWith({ A: 'Active', B: 'New' }), 'B', 50);
    expect(statusOf(next)).toEqual({ A: 'New', B: 'Active' });
  });

  it('resumes an On hold toy keeping its stored price and bidder', () => {
    const next = selectToy(auctionWith({ A: 'On hold', B: 'Active' }, ['A']), 'A', 50);
    expect(next.toys[0]).toMatchObject({ status: 'Active', nextBidPrice: 70, salePrice: 60, currentBidderId: 'tony' });
    expect(statusOf(next)).toEqual({ A: 'Active', B: 'New' });
  });

  it('reopens a Sold toy and resets it to the start price', () => {
    const next = selectToy(auctionWith({ A: 'Sold', B: 'Active' }, ['A']), 'A', 50);
    expect(statusOf(next)).toEqual({ A: 'Active', B: 'New' });
    expect(next.toys[0]).toMatchObject({ nextBidPrice: 50, salePrice: null, currentBidderId: null });
  });

  it('is a no-op for the already-active toy', () => {
    const auction = auctionWith({ A: 'Active', B: 'New' });
    expect(selectToy(auction, 'A', 50)).toBe(auction);
  });

  it('rejects a toy that is not part of the auction', () => {
    expect(() => selectToy(auctionWith({ A: 'New' }), 'Z', 50)).toThrow('not part of the auction');
  });
});
