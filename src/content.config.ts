import { defineCollection, z } from "astro:content";
import { ghostLoader } from "./lib/ghost-loader";

const posts = defineCollection({
  loader: ghostLoader(),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    draft: z.boolean().default(false),
    html: z.string(),
  }),
});

export const collections = { posts };
