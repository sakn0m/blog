import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { notFound } from "next/navigation";

const postsDirectory = path.join(process.cwd(), "posts");

export type Post = {
    slug: string;
    title: string;
    date: string;
    isoDate: string;
    content: string;
};

function getPostSlugs() {
    return fs.readdirSync(postsDirectory).filter((file) => file.endsWith(".md"));
}

export function getPostBySlug(slug: string): Post {
    const realSlug = slug.replace(/\.md$/, "");
    const fullPath = path.resolve(postsDirectory, `${realSlug}.md`);

    // Prevent path traversal
    if (!fullPath.startsWith(postsDirectory)) {
        notFound();
    }

    let fileContents: string;
    try {
        fileContents = fs.readFileSync(fullPath, "utf8");
    } catch {
        notFound();
    }

    const { data, content } = matter(fileContents);
    const isoDate = new Date(data.date).toISOString().split("T")[0];

    return {
        slug: realSlug,
        title: data.title,
        date: data.date,
        isoDate,
        content,
    };
}

export function getAllPosts(): Post[] {
    const slugs = getPostSlugs();
    const posts = slugs
        .map((slug) => getPostBySlug(slug))
        .sort((a, b) => (a.isoDate > b.isoDate ? -1 : 1));
    return posts;
}
