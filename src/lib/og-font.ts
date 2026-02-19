import { decompress } from 'wawoff2';
import fs from 'node:fs';
import path from 'node:path';

// path.resolve() is anchored to CWD, which Astro always sets to the project root at build time
const fontPath = path.resolve('./public/fonts/charter-regular.woff2');

let cached: ArrayBuffer | null = null;

export async function getCharterFont(): Promise<ArrayBuffer> {
    if (!cached) {
        const woff2 = fs.readFileSync(fontPath);
        cached = await decompress(woff2);
    }
    return cached!;
}
