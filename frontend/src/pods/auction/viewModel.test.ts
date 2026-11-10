import { describe, expect, it } from 'vitest';
import type { AuctionToyDetail, AuctionToyStatus } from '@kristy/shared';
import { buildAuctionToyListItems } from './viewModel';

const makeLot = (
  id: string,
  name: string,
  photo: string | null,
  status: AuctionToyStatus,
): AuctionToyDetail => ({
  toyId: id,
  status,
  nextBidPrice: 10,
  salePrice: null,
  currentBidderId: null,
  toy: { id, name, photo, description: '', model: '', startPrice: 10 },
});

describe('buildAuctionToyListItems', () => {
  it('returns one item per auction toy in auction order', () => {
    const items = buildAuctionToyListItems([
      makeLot('a', 'Bear', '/a.png', 'New'),
      makeLot('b', 'Robot', '/b.png', 'Active'),
      makeLot('c', 'Kite', null, 'Sold'),
    ]);
    expect(items.map((item) => item.toyId)).toEqual(['a', 'b', 'c']);
  });

  it('maps toy name, photo and auction toy status into each item', () => {
    const items = buildAuctionToyListItems([makeLot('a', 'Bear', '/a.png', 'On hold')]);
    expect(items[0]).toEqual({ toyId: 'a', name: 'Bear', photo: '/a.png', status: 'On hold' });
  });

  it('yields photo null when the toy has no photo', () => {
    const items = buildAuctionToyListItems([makeLot('a', 'Bear', null, 'New')]);
    expect(items[0].photo).toBeNull();
  });
});
