import path from 'node:path';
import type { Toy } from '@kristy/shared';
import { config } from '../core/config';
import { JsonStore } from '../core/jsonStore';
import { seedToys } from './toys.seed';

const store = new JsonStore<Toy[]>(path.join(config.dataDir, 'toys.json'), seedToys);

export const toysRepository = {
  all: (): Toy[] => store.read(),
  find: (id: string): Toy | undefined => store.read().find((t) => t.id === id),
  save(toys: Toy[]): void {
    store.write(toys);
  },
};
