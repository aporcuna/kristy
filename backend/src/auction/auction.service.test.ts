import { describe, expect, it } from 'vitest';
import type { Auction, AuctionToyStatus, Toy } from '@kristy/shared';
import { createAuction, navigate, selectToy, setActiveToy } from './auction.service';

const toy = (id: string, startPrice = 50): Toy => ({
  id,
  name: id,
  photo: null,
  description: '',
  model: '',
  startPrice,
});

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

describe('createAuction', () => {
  it('starts every toy as New at its start price', () => {
    const auction = createAuction('Summer', [toy('A', 50), toy('B', 20)]);
    expect(auction.toys.map((t) => [t.status, t.nextBidPrice, t.salePrice, t.currentBidderId])).toEqual([
      ['New', 50, null, null],
      ['New', 20, null, null],
    ]);
  });

  it('requires a name and at least one toy', () => {
    expect(() => createAuction('  ', [toy('A')])).toThrow('name');
    expect(() => createAuction('Summer', [])).toThrow('at least one');
  });
});

describe('setActiveToy', () => {
  it('activates a New toy', () => {
    const next = setActiveToy(auctionWith({ A: 'New', B: 'New' }), 'A');
    expect(statusOf(next)).toEqual({ A: 'Active', B: 'New' });
  });

  it('sends the previous toy back to New when it has no bids', () => {
    const next = setActiveToy(auctionWith({ A: 'Active', B: 'New' }), 'B');
    expect(statusOf(next)).toEqual({ A: 'New', B: 'Active' });
  });

  it('puts the previous toy On hold keeping its bid data', () => {
    const next = setActiveToy(auctionWith({ A: 'Active', B: 'New' }, ['A']), 'B');
    expect(statusOf(next)).toEqual({ A: 'On hold', B: 'Active' });
    expect(next.toys[0]).toMatchObject({ nextBidPrice: 70, salePrice: 60, currentBidderId: 'tony' });
  });

  it('resumes an On hold toy with its kept data', () => {
    const next = setActiveToy(auctionWith({ A: 'On hold', B: 'Active' }, ['A']), 'A');
    expect(next.toys[0]).toMatchObject({ status: 'Active', nextBidPrice: 70, salePrice: 60 });
  });

  it('rejects unknown and sold toys', () => {
    expect(() => setActiveToy(auctionWith({ A: 'New' }), 'Z')).toThrow();
    expect(() => setActiveToy(auctionWith({ A: 'Sold' }), 'A')).toThrow();
  });
});

describe('selectToy', () => {
  it('persists activation of a New toy', () => {
    const next = selectToy(auctionWith({ A: 'Active', B: 'New' }), 'B', [toy('B', 20)]);
    expect(statusOf(next)).toEqual({ A: 'New', B: 'Active' });
  });

  it('persists the reset when reopening a Sold toy', () => {
    const next = selectToy(auctionWith({ A: 'Sold', B: 'Active' }, ['A']), 'A', [toy('A', 20)]);
    expect(next.toys[0]).toMatchObject({
      status: 'Active',
      nextBidPrice: 20,
      salePrice: null,
      currentBidderId: null,
    });
    expect(statusOf(next)).toEqual({ A: 'Active', B: 'New' });
  });

  it('rejects a toy that is not part of the auction', () => {
    expect(() => selectToy(auctionWith({ A: 'New' }), 'Z', [toy('Z')])).toThrow('not part of the auction');
  });
});

describe('navigate', () => {
  it('Next skips sold toys', () => {
    const next = navigate(auctionWith({ A: 'Active', B: 'Sold', C: 'New' }), 'next');
    expect(statusOf(next)).toEqual({ A: 'New', B: 'Sold', C: 'Active' });
  });

  it('Previous skips sold toys', () => {
    const next = navigate(auctionWith({ A: 'On hold', B: 'Sold', C: 'Active' }), 'previous');
    expect(statusOf(next)).toEqual({ A: 'Active', B: 'Sold', C: 'New' });
  });

  it('does not wrap around', () => {
    expect(() => navigate(auctionWith({ A: 'New', B: 'Active' }), 'next')).toThrow();
    expect(() => navigate(auctionWith({ A: 'Active', B: 'New' }), 'previous')).toThrow();
  });

  it('fails when only sold toys are around', () => {
    expect(() => navigate(auctionWith({ A: 'Sold', B: 'Active', C: 'Sold' }), 'next')).toThrow();
    expect(() => navigate(auctionWith({ A: 'Sold', B: 'Active', C: 'Sold' }), 'previous')).toThrow();
  });
});
