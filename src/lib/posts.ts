import { getCollection } from 'astro:content';

export async function getPublishedPosts() {
  return (await getCollection('posts'))
    .filter((post) => import.meta.env.PROD ? !post.data.draft : true)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
