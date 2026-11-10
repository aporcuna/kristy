import cors from 'cors';
import express from 'express';
import { auctionRouter } from './auction/auction.routes';
import { biddersRouter } from './bidders/bidders.routes';
import { config } from './core/config';
import { errorHandler } from './core/httpError';
import { toysRouter } from './toys/toys.routes';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(config.uploadsUrlPrefix, express.static(config.uploadsDir));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  app.use('/api/toys', toysRouter);
  app.use('/api/bidders', biddersRouter);
  app.use('/api/auction', auctionRouter);

  app.use(errorHandler);
  return app;
}
