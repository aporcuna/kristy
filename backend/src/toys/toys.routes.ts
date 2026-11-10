import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import type { Toy } from '@kristy/shared';
import { config } from '../core/config';
import { HttpError } from '../core/httpError';
import { toysRepository } from './toys.repository';

fs.mkdirSync(config.uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: config.uploadsDir,
    filename: (_req, file, cb) =>
      cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new HttpError(400, 'Only image files can be uploaded'));
  },
});

const photoUrl = (filename: string) => `${config.uploadsUrlPrefix}/${filename}`;

function removeFile(url: string | null): void {
  if (!url?.startsWith(`${config.uploadsUrlPrefix}/`)) return;
  const file = path.join(config.uploadsDir, path.basename(url));
  fs.rm(file, { force: true }, () => undefined);
}

interface ToyFields {
  name: string;
  description: string;
  model: string;
  startPrice: number;
}

function parseFields(body: Record<string, unknown>): ToyFields {
  const name = String(body.name ?? '').trim();
  if (!name) throw new HttpError(400, 'Toy name is required');
  const startPrice = Number(body.startPrice);
  if (body.startPrice === undefined || body.startPrice === '' || !Number.isFinite(startPrice) || startPrice < 0) {
    throw new HttpError(400, 'Start price must be a number of 0 or more');
  }
  return {
    name,
    description: String(body.description ?? '').trim(),
    model: String(body.model ?? '').trim(),
    startPrice,
  };
}

export const toysRouter = Router();

toysRouter.get('/', (_req, res) => {
  res.json(toysRepository.all());
});

toysRouter.get('/:id', (req, res) => {
  const toy = toysRepository.find(req.params.id);
  if (!toy) throw new HttpError(404, 'Toy not found');
  res.json(toy);
});

toysRouter.post('/', upload.single('photo'), (req, res) => {
  try {
    const fields = parseFields(req.body);
    const toy: Toy = {
      id: crypto.randomUUID(),
      ...fields,
      photo: req.file ? photoUrl(req.file.filename) : null,
    };
    toysRepository.save([...toysRepository.all(), toy]);
    res.status(201).json(toy);
  } catch (err) {
    if (req.file) removeFile(photoUrl(req.file.filename));
    throw err;
  }
});

toysRouter.put('/:id', upload.single('photo'), (req, res) => {
  try {
    const toys = toysRepository.all();
    const index = toys.findIndex((t) => t.id === req.params.id);
    if (index === -1) throw new HttpError(404, 'Toy not found');
    const fields = parseFields(req.body);
    const current = toys[index];

    let photo = current.photo;
    if (req.file) photo = photoUrl(req.file.filename);
    else if (req.body.removePhoto === 'true') photo = null;
    if (photo !== current.photo) removeFile(current.photo);

    const updated: Toy = { ...current, ...fields, photo };
    toys[index] = updated;
    toysRepository.save(toys);
    res.json(updated);
  } catch (err) {
    if (req.file) removeFile(photoUrl(req.file.filename));
    throw err;
  }
});

toysRouter.delete('/:id', (req, res) => {
  const toys = toysRepository.all();
  const toy = toys.find((t) => t.id === req.params.id);
  if (!toy) throw new HttpError(404, 'Toy not found');
  toysRepository.save(toys.filter((t) => t.id !== toy.id));
  removeFile(toy.photo);
  res.status(204).end();
});
