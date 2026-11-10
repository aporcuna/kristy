import type { Bidder } from '@kristy/shared';
import { request } from '../../../core/api';

const json = (name: string) => JSON.stringify({ name });

export const biddersService = {
  list: () => request<Bidder[]>('/bidders'),
  create: (name: string) => request<Bidder>('/bidders', { method: 'POST', body: json(name) }),
  update: (id: string, name: string) => request<Bidder>(`/bidders/${id}`, { method: 'PUT', body: json(name) }),
  remove: (id: string) => request<void>(`/bidders/${id}`, { method: 'DELETE' }),
};
