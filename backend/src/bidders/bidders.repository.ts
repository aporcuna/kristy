import path from 'node:path';
import type { Bidder } from '@kristy/shared';
import { config } from '../core/config';
import { JsonStore } from '../core/jsonStore';

const names = ['Lisa', 'Tony', 'Martha', 'Emma', 'Leo', 'Sofia', 'Max', 'Chloe', 'Noah', 'Ruby'];

const seedBidders = (): Bidder[] =>
  names.map((name, i) => ({ id: `bidder-${String(i + 1).padStart(2, '0')}`, name }));

const store = new JsonStore<Bidder[]>(path.join(config.dataDir, 'bidders.json'), seedBidders);

export const biddersRepository = {
  all: (): Bidder[] => store.read(),
  save(bidders: Bidder[]): void {
    store.write(bidders);
  },
};
