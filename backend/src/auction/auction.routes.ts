import { Router } from 'express';
import type { Auction, AuctionDetail, Direction } from '@kristy/shared';
import { HttpError } from '../core/httpError';
import { toysRepository } from '../toys/toys.repository';
import { auctionRepository } from './auction.repository';
import { createAuction, navigate, reopenToy, setActiveToy } from './auction.service';

function current(): Auction {
  const auction = auctionRepository.get();
  if (!auction) throw new HttpError(404, 'There is no auction running');
  return auction;
}

function toDetail(auction: Auction): AuctionDetail {
  const toys = toysRepository.all();
  return {
    id: auction.id,
    name: auction.name,
    toys: auction.toys.flatMap((lot) => {
      const toy = toys.find((t) => t.id === lot.toyId);
      return toy ? [{ ...lot, toy }] : [];
    }),
  };
}

export const auctionRouter = Router();

auctionRouter.get('/', (_req, res) => {
  res.json(toDetail(current()));
});

// Creating an auction replaces any previous one (no history is kept).
auctionRouter.post('/', (req, res) => {
  const { name, toyIds } = req.body ?? {};
  if (!Array.isArray(toyIds)) throw new HttpError(400, 'toyIds must be a list');
  const catalogue = toysRepository.all();
  const toys = toyIds.map((id) => {
    const toy = catalogue.find((t) => t.id === id);
    if (!toy) throw new HttpError(400, `Unknown toy: ${String(id)}`);
    return toy;
  });
  const auction = createAuction(String(name ?? ''), toys);
  auctionRepository.save(auction);
  res.status(201).json(toDetail(auction));
});

auctionRouter.delete('/', (_req, res) => {
  auctionRepository.save(null);
  res.status(204).end();
});

auctionRouter.post('/active', (req, res) => {
  const auction = setActiveToy(current(), String(req.body?.toyId ?? ''));
  auctionRepository.save(auction);
  res.json(toDetail(auction));
});

auctionRouter.post('/reopen', (req, res) => {
  const toyId = String(req.body?.toyId ?? '');
  const toy = toysRepository.all().find((t) => t.id === toyId);
  if (!toy) throw new HttpError(400, `Unknown toy: ${toyId}`);
  const auction = reopenToy(current(), toyId, toy.startPrice);
  auctionRepository.save(auction);
  res.json(toDetail(auction));
});

auctionRouter.post('/navigate', (req, res) => {
  const direction = req.body?.direction;
  if (direction !== 'previous' && direction !== 'next') {
    throw new HttpError(400, 'direction must be "previous" or "next"');
  }
  const auction = navigate(current(), direction as Direction);
  auctionRepository.save(auction);
  res.json(toDetail(auction));
});
