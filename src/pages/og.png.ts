import type { APIRoute } from 'astro';
import { renderOgImage } from '../lib/og';
import { SITE_TITLE, SITE_DESCRIPTION } from '../lib/consts';

export const GET: APIRoute = async () => {
  const png = await renderOgImage(SITE_TITLE, SITE_DESCRIPTION);

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
