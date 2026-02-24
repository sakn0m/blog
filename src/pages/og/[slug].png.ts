import type { APIRoute, InferGetStaticPropsType } from 'astro';
import { getCollection } from 'astro:content';
import { renderOgImage } from '../../lib/og';
import { formatDate } from '../../lib/date';

export async function getStaticPaths() {
  const posts = await getCollection('posts');
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as Props;
  const png = await renderOgImage(post.data.title, formatDate(post.data.date));

  return new Response(png as unknown as ArrayBuffer, {
    headers: { 'Content-Type': 'image/png' },
  });
};
