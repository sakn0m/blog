import type { APIRoute } from 'astro';
import { SITE_TITLE } from '../lib/consts';
import { renderOgImage } from '../lib/og';

export const GET: APIRoute = async () => {
  const png = await renderOgImage(SITE_TITLE, '', { isHomepage: true });

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
