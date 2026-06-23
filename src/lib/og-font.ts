import { decompress } from 'wawoff2';
import fs from 'node:fs';
import path from 'node:path';

const fontDir = path.resolve('./src/assets/fonts');

let regularCache: ArrayBuffer | null = null;
let boldCache: ArrayBuffer | null = null;

async function loadWoff2(filename: string, cache: { current: ArrayBuffer | null }): Promise<ArrayBuffer> {
    if (cache.current) return cache.current;
    const woff2 = fs.readFileSync(path.resolve(fontDir, filename));
    cache.current = await decompress(woff2);
    return cache.current;
}

export function getCharterRegular(): Promise<ArrayBuffer> {
    return loadWoff2('charter-regular.woff2', { current: regularCache });
}

export function getCharterBold(): Promise<ArrayBuffer> {
    return loadWoff2('charter-bold.woff2', { current: boldCache });
}
