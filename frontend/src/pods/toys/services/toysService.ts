import type { Toy } from '@kristy/shared';
import { request } from '../../../core/api';

export const toysService = {
  list: () => request<Toy[]>('/toys'),
  create: (data: FormData) => request<Toy>('/toys', { method: 'POST', body: data }),
  update: (id: string, data: FormData) => request<Toy>(`/toys/${id}`, { method: 'PUT', body: data }),
  remove: (id: string) => request<void>(`/toys/${id}`, { method: 'DELETE' }),
};
