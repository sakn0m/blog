import type { MetadataRoute } from "next";
import { getAllPosts } from "@/app/lib/posts";

const BASE_URL = "https://jojo.news";

export default function sitemap(): MetadataRoute.Sitemap {
    const posts = getAllPosts();

    const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
        url: `${BASE_URL}/posts/${post.slug}`,
        lastModified: post.isoDate,
    }));

    return [
        { url: BASE_URL, lastModified: new Date().toISOString().split("T")[0] },
        ...postEntries,
    ];
}
