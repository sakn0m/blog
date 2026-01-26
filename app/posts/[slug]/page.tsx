import Link from "next/link";
import Markdown from "markdown-to-jsx";

import { getPostBySlug } from "../../lib/posts";
import { MarkdownImage } from "../../components/markdown-image";

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    return (
        <>
            <Link href="/" className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors mb-8 block">
                ← Back
            </Link>

            <article className="max-w-none">
                <h1 className="text-3xl font-medium mb-4 text-neutral-900 dark:text-neutral-100">{post.title}</h1>
                <div className="text-sm text-neutral-400 dark:text-neutral-500 italic mb-8">
                    {post.date}
                </div>
                <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
                    <Markdown options={{ overrides: { img: MarkdownImage } }}>{post.content}</Markdown>
                </div>
            </article>
        </>
    );
}
