import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE_TITLE, SITE_DESCRIPTION } from '../lib/consts';
import { getPublishedPosts } from '../lib/posts';
import { getDescription } from '../lib/description';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site!,
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: getDescription(post.data.description, post.body),
      link: `/posts/${post.id}`,
    })),
  });
}
