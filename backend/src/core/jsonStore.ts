import fs from 'node:fs';
import path from 'node:path';

/** Tiny JSON-file "database". Seeds the file on first read. */
export class JsonStore<T> {
  constructor(
    private readonly file: string,
    private readonly seed: () => T,
  ) {}

  read(): T {
    if (!fs.existsSync(this.file)) this.write(this.seed());
    return JSON.parse(fs.readFileSync(this.file, 'utf-8')) as T;
  }

  write(value: T): void {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    fs.writeFileSync(this.file, JSON.stringify(value, null, 2), 'utf-8');
  }
}
