import { decompress } from 'wawoff2';
import fs from 'node:fs';
import path from 'node:path';

const fontDir = path.resolve('./src/assets/fonts');

let regularCache: ArrayBuffer | null = null;

export async function getCharterRegular(): Promise<ArrayBuffer> {
    if (regularCache) return regularCache;
    const woff2 = fs.readFileSync(path.resolve(fontDir, 'charter-regular.woff2'));
    regularCache = await decompress(woff2);
    return regularCache;
}

export function getMonoFont(): ArrayBuffer {
    const buf = fs.readFileSync(path.resolve(fontDir, 'hack-regular.ttf'));
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}
