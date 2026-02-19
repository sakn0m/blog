import type { APIRoute, InferGetStaticPropsType } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import sharp from 'sharp';
import { decompress } from 'wawoff2';
import fs from 'node:fs';
import path from 'node:path';

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

  const fontPath = path.resolve('./public/fonts/charter-regular.woff2');
  const woff2 = fs.readFileSync(fontPath);
  const fontData = await decompress(woff2);

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          backgroundColor: '#fafafa',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { fontSize: 56, fontWeight: 500, color: '#171717' },
              children: post.data.title,
            },
          },
          {
            type: 'div',
            props: {
              style: { fontSize: 24, color: '#a3a3a3', marginTop: 16, fontStyle: 'italic' },
              children: post.data.date,
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Charter',
          data: fontData,
          weight: 400,
          style: 'normal',
        },
      ],
    }
  );

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
