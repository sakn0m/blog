import Link from "next/link";
import Markdown from "markdown-to-jsx";
import type { Metadata } from "next";

import { getPostBySlug, getAllPosts } from "@/app/lib/posts";
import { MarkdownImage } from "@/app/components/markdown-image";

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    return {
        title: `${post.title} — jojo's thoughts`,
        description: post.content.slice(0, 160).replace(/\n/g, " ").trim(),
        openGraph: {
            title: post.title,
            description: post.content.slice(0, 160).replace(/\n/g, " ").trim(),
            type: "article",
            publishedTime: post.isoDate,
        },
    };
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        datePublished: post.isoDate,
        author: { "@type": "Person", name: "jojo" },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <Link href="/" className="text-neutral-400 hover-hover:hover:text-neutral-600 hover-hover:dark:hover:text-neutral-200 active:text-neutral-600 dark:active:text-neutral-200 transition-colors mb-8 block outline-none">
                ← Back
            </Link>

            <article className="max-w-none">
                <h1 className="text-3xl font-medium mb-4 text-neutral-900 dark:text-neutral-50">{post.title}</h1>
                <time dateTime={post.isoDate} className="text-sm text-neutral-400 dark:text-neutral-500 italic mb-8 block">
                    {post.date}
                </time>
                <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
                    <Markdown options={{ overrides: { img: MarkdownImage } }}>{post.content}</Markdown>
                </div>
            </article>
        </>
    );
}
