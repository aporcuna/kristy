import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export const config = {
  port: Number(process.env.PORT ?? 3001),
  dataDir: process.env.DATA_DIR ?? path.join(root, 'data'),
  uploadsDir: process.env.UPLOADS_DIR ?? path.join(root, 'uploads'),
  uploadsUrlPrefix: '/uploads',
};
