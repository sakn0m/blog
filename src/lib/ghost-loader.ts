import type { Loader } from 'astro/loaders';

export function ghostLoader(): Loader {
  return {
    name: 'ghost-loader',
    load: async ({ store, logger }) => {
      const url = import.meta.env.GHOST_URL;
      const key = import.meta.env.GHOST_KEY;

      if (!url || !key) {
        logger.warn('GHOST_URL or GHOST_KEY not set — skipping Ghost content load');
        return;
      }

      const res = await fetch(
        `${url}/ghost/api/content/posts/?key=${key}&formats=html&limit=all&order=published_at%20desc`
      );

      if (!res.ok) {
        logger.error(`Ghost API returned ${res.status}`);
        return;
      }

      const { posts } = await res.json();

      store.clear();

      for (const post of posts) {
        store.set({
          id: post.slug,
          data: {
            title: post.title,
            date: new Date(post.published_at.slice(0, 10) + 'T12:00:00Z'),
            description: post.custom_excerpt || undefined,
            draft: false,
            html: post.html,
          },
        });
      }

      logger.info(`Loaded ${posts.length} posts from Ghost`);
    },
  };
}
