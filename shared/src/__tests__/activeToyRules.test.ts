import { describe, expect, it } from 'vitest';
import type { Auction, AuctionToyStatus } from '../types';
import { changeActiveToy, reopenSoldToy } from '../auctionRules';

const auctionWith = (
  statuses: Record<string, AuctionToyStatus>,
  bids: string[] = [],
): Auction => ({
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

const statusOf = (auction: Auction) =>
  Object.fromEntries(auction.toys.map((t) => [t.toyId, t.status]));

describe('changeActiveToy', () => {
  it('moves an active toy with bids to On hold and activates the target', () => {
    const next = changeActiveToy(auctionWith({ A: 'Active', B: 'New' }, ['A']), 'B');
    expect(statusOf(next)).toEqual({ A: 'On hold', B: 'Active' });
    expect(next.toys[0]).toMatchObject({ nextBidPrice: 70, salePrice: 60, currentBidderId: 'tony' });
  });

  it('moves an active toy without bids back to New', () => {
    const next = changeActiveToy(auctionWith({ A: 'Active', B: 'New' }), 'B');
    expect(statusOf(next)).toEqual({ A: 'New', B: 'Active' });
    expect(next.toys[0]).toMatchObject({ nextBidPrice: 50, salePrice: null, currentBidderId: null });
  });

  it('activates a New target toy', () => {
    const next = changeActiveToy(auctionWith({ A: 'New', B: 'New' }), 'A');
    expect(statusOf(next)).toEqual({ A: 'Active', B: 'New' });
  });

  it('resumes an On hold target with retained data', () => {
    const next = changeActiveToy(auctionWith({ A: 'On hold', B: 'Active' }, ['A']), 'A');
    expect(next.toys[0]).toMatchObject({
      status: 'Active',
      nextBidPrice: 70,
      salePrice: 60,
      currentBidderId: 'tony',
    });
  });

  it('rejects unknown and sold toys', () => {
    expect(() => changeActiveToy(auctionWith({ A: 'New' }), 'Z')).toThrow();
    expect(() => changeActiveToy(auctionWith({ A: 'Sold' }), 'A')).toThrow();
  });

  it('leaves the auction unchanged when the target is already active', () => {
    const auction = auctionWith({ A: 'Active', B: 'New' });
    expect(changeActiveToy(auction, 'A')).toBe(auction);
  });
});

describe('reopenSoldToy', () => {
  it('reopens a Sold toy reset to start price', () => {
    const next = reopenSoldToy(auctionWith({ A: 'Sold', B: 'New' }, ['A']), 'A', 25);
    expect(statusOf(next)).toEqual({ A: 'Active', B: 'New' });
    expect(next.toys[0]).toMatchObject({
      status: 'Active',
      nextBidPrice: 25,
      salePrice: null,
      currentBidderId: null,
    });
  });

  it('puts the previous active toy On hold when it has bids', () => {
    const next = reopenSoldToy(auctionWith({ A: 'Active', B: 'Sold' }, ['A']), 'B', 25);
    expect(statusOf(next)).toEqual({ A: 'On hold', B: 'Active' });
    expect(next.toys[0]).toMatchObject({ nextBidPrice: 70, salePrice: 60, currentBidderId: 'tony' });
  });

  it('sends the previous active toy back to New when it has no bids', () => {
    const next = reopenSoldToy(auctionWith({ A: 'Active', B: 'Sold' }), 'B', 25);
    expect(statusOf(next)).toEqual({ A: 'New', B: 'Active' });
  });

  it('rejects unknown toys and toys that are not sold', () => {
    expect(() => reopenSoldToy(auctionWith({ A: 'New' }), 'Z', 25)).toThrow();
    expect(() => reopenSoldToy(auctionWith({ A: 'New' }), 'A', 25)).toThrow();
  });

  it('does not change non-target toys', () => {
    const next = reopenSoldToy(auctionWith({ A: 'Sold', B: 'On hold' }, ['B']), 'A', 25);
    expect(next.toys[1]).toMatchObject({
      status: 'On hold',
      nextBidPrice: 70,
      salePrice: 60,
      currentBidderId: 'tony',
    });
  });
});
