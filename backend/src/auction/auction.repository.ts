import path from 'node:path';
import type { Auction } from '@kristy/shared';
import { config } from '../core/config';
import { JsonStore } from '../core/jsonStore';

/** Only the current auction exists; null when there is none. */
const store = new JsonStore<Auction | null>(path.join(config.dataDir, 'auction.json'), () => null);

export const auctionRepository = {
  get: (): Auction | null => store.read(),
  save(auction: Auction | null): void {
    store.write(auction);
  },
};
