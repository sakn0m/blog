import type { APIRoute } from 'astro';
import { renderOgImage } from '../lib/og';
import { SITE_TITLE, SITE_DESCRIPTION } from '../lib/consts';

export const GET: APIRoute = async () => {
  const png = await renderOgImage(SITE_TITLE, SITE_DESCRIPTION, { isHomepage: true });

  return new Response(png as unknown as ArrayBuffer, {
    headers: { 'Content-Type': 'image/png' },
  });
};
