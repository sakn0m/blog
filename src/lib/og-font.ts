import { decompress } from 'wawoff2';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// Resolved relative to this file — robust regardless of build cwd
const fontPath = fileURLToPath(
    new URL('../../public/fonts/charter-regular.woff2', import.meta.url)
);

let cached: ArrayBuffer | null = null;

export async function getCharterFont(): Promise<ArrayBuffer> {
    if (!cached) {
        const woff2 = fs.readFileSync(fontPath);
        cached = await decompress(woff2);
    }
    return cached!;
}
