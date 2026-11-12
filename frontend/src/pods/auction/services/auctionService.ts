import type { AuctionDetail, CreateAuctionRequest, Direction } from '@kristy/shared';
import { request } from '../../../core/api';

export const auctionService = {
  get: () => request<AuctionDetail>('/auction'),
  create: (body: CreateAuctionRequest) =>
    request<AuctionDetail>('/auction', { method: 'POST', body: JSON.stringify(body) }),
  close: () => request<void>('/auction', { method: 'DELETE' }),
  setActive: (toyId: string) =>
    request<AuctionDetail>('/auction/active', { method: 'POST', body: JSON.stringify({ toyId }) }),
  select: (toyId: string) =>
    request<AuctionDetail>('/auction/select', { method: 'POST', body: JSON.stringify({ toyId }) }),
  navigate: (direction: Direction) =>
    request<AuctionDetail>('/auction/navigate', { method: 'POST', body: JSON.stringify({ direction }) }),
};
