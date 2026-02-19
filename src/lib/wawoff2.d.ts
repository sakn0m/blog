declare module 'wawoff2' {
    export function decompress(data: Uint8Array | Buffer): Promise<ArrayBuffer>;
}
