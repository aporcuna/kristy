import { describe, expect, it } from 'vitest';
import type { AuctionToyDetail, AuctionToyStatus } from '../types';
import { buildAuctionToyListItems, findActiveToy } from '../auctionRules';

const makeLot = (id: string, status: AuctionToyStatus): AuctionToyDetail => ({
  toyId: id,
  status,
  nextBidPrice: 10,
  salePrice: null,
  currentBidderId: null,
  toy: { id, name: `Toy ${id}`, photo: `/${id}.png`, description: '', model: '', startPrice: 10 },
});

describe('buildAuctionToyListItems', () => {
  it('lists all auction toys in stored order', () => {
    const items = buildAuctionToyListItems([
      makeLot('a', 'New'),
      makeLot('b', 'On hold'),
      makeLot('c', 'Sold'),
    ]);
    expect(items.map((item) => item.toyId)).toEqual(['a', 'b', 'c']);
  });

  it('derives the active toy', () => {
    const items = buildAuctionToyListItems([
      makeLot('a', 'New'),
      makeLot('b', 'Active'),
      makeLot('c', 'On hold'),
    ]);
    const activeItems = items.filter((item) => item.isActive);
    expect(activeItems).toHaveLength(1);
    expect(activeItems[0].toyId).toBe('b');
  });

  it('marks no item active when no toy is active', () => {
    const items = buildAuctionToyListItems([makeLot('a', 'New'), makeLot('b', 'Sold')]);
    expect(items.some((item) => item.isActive)).toBe(false);
  });

  it('preserves each toy status', () => {
    const items = buildAuctionToyListItems([
      makeLot('a', 'New'),
      makeLot('b', 'Active'),
      makeLot('c', 'On hold'),
      makeLot('d', 'Sold'),
    ]);
    expect(items.map((item) => item.status)).toEqual(['New', 'Active', 'On hold', 'Sold']);
  });

  it('joins the catalogue name and photo into each item', () => {
    const items = buildAuctionToyListItems([makeLot('a', 'New')]);
    expect(items[0].name).toBe('Toy a');
    expect(items[0].photo).toBe('/a.png');
  });

  it('yields photo null when the toy has no photo', () => {
    const lot = makeLot('a', 'New');
    lot.toy = { ...lot.toy, photo: null };
    const items = buildAuctionToyListItems([lot]);
    expect(items[0].photo).toBeNull();
  });
});

describe('findActiveToy', () => {
  it('derives the active toy from the auction state', () => {
    const toys = [makeLot('a', 'New'), makeLot('b', 'Active')];
    expect(findActiveToy(toys)?.toyId).toBe('b');
  });

  it('returns undefined when no toy is active', () => {
    expect(findActiveToy([makeLot('a', 'New'), makeLot('b', 'Sold')])).toBeUndefined();
  });
});
