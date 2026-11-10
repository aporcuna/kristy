import crypto from 'node:crypto';
import { Router } from 'express';
import type { Bidder } from '@kristy/shared';
import { HttpError } from '../core/httpError';
import { biddersRepository } from './bidders.repository';

function parseName(body: Record<string, unknown> | undefined): string {
  const name = String(body?.name ?? '').trim();
  if (!name) throw new HttpError(400, 'Bidder name is required');
  return name;
}

export const biddersRouter = Router();

biddersRouter.get('/', (_req, res) => {
  res.json(biddersRepository.all());
});

biddersRouter.post('/', (req, res) => {
  const bidder: Bidder = { id: crypto.randomUUID(), name: parseName(req.body) };
  biddersRepository.save([...biddersRepository.all(), bidder]);
  res.status(201).json(bidder);
});

biddersRouter.put('/:id', (req, res) => {
  const bidders = biddersRepository.all();
  const index = bidders.findIndex((b) => b.id === req.params.id);
  if (index === -1) throw new HttpError(404, 'Bidder not found');
  bidders[index] = { ...bidders[index], name: parseName(req.body) };
  biddersRepository.save(bidders);
  res.json(bidders[index]);
});

biddersRouter.delete('/:id', (req, res) => {
  const bidders = biddersRepository.all();
  if (!bidders.some((b) => b.id === req.params.id)) throw new HttpError(404, 'Bidder not found');
  biddersRepository.save(bidders.filter((b) => b.id !== req.params.id));
  res.status(204).end();
});
