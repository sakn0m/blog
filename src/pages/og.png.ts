import type { APIRoute } from 'astro';
import { renderOgImage } from '../lib/og';
import { SITE_TITLE } from '../lib/consts';

export const GET: APIRoute = async () => {
  const png = await renderOgImage(SITE_TITLE, '', { isHomepage: true });

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
