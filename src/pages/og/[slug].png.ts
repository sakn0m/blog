import type { APIRoute, InferGetStaticPropsType } from 'astro';
import { renderOgImage } from '../../lib/og';
import { formatDate } from '../../lib/date';
import { getPublishedPosts } from '../../lib/posts';

export async function getStaticPaths() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as Props;
  const png = await renderOgImage(post.data.title, formatDate(post.data.date));

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
