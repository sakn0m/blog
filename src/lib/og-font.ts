import fs from 'node:fs';
import path from 'node:path';
import { decompress } from 'wawoff2';

// Resolved from the project root: Astro runs the build/prerender with CWD set to the repo root.
const fontDir = path.resolve('src/assets/fonts');

const woff2Cache = new Map<string, ArrayBuffer>();

// wawoff2 uses a shared wasm heap and is not re-entrant, so decompressions are serialized.
let queue: Promise<unknown> = Promise.resolve();

function loadWoff2(name: string): Promise<ArrayBuffer> {
  const cached = woff2Cache.get(name);
  if (cached) return Promise.resolve(cached);

  const task = queue.then(async () => {
    const existing = woff2Cache.get(name);
    if (existing) return existing;

    const file = fs.readFileSync(path.join(fontDir, name));
    // wawoff2 reuses a shared wasm heap, so copy the bytes before the next decompression.
    const data = (await decompress(file)).slice(0);
    woff2Cache.set(name, data);
    return data;
  });

  queue = task.catch(() => undefined);
  return task;
}

export function getCharterRegular(): Promise<ArrayBuffer> {
  return loadWoff2('charter-regular.woff2');
}

export function getCharterBold(): Promise<ArrayBuffer> {
  return loadWoff2('charter-bold.woff2');
}

let monoCache: ArrayBuffer | null = null;

export function getMonoFont(): ArrayBuffer {
  if (monoCache) return monoCache;

  const buf = fs.readFileSync(path.join(fontDir, 'hack-regular.ttf'));
  monoCache = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  return monoCache;
}
