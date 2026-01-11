import Link from "next/link";
import Markdown from "markdown-to-jsx";
import { ThemeToggle } from "../../theme-toggle";
import { getPostBySlug } from "../../lib/posts";

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    return (
        <main className="max-w-[600px] mx-auto px-6 py-24 md:py-32 font-serif relative">
            <div className="absolute top-6 right-6 md:top-12 md:right-0">
                <ThemeToggle />
            </div>

            <Link href="/" className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors mb-8 block">
                ← Back
            </Link>

            <article className="prose dark:prose-invert prose-neutral max-w-none">
                <h1 className="text-3xl font-medium mb-4 capitalize text-neutral-900 dark:text-neutral-100">{post.title}</h1>
                <div className="text-sm text-neutral-400 dark:text-neutral-500 italic mb-8">
                    {post.date}
                </div>
                <div className="text-lg text-neutral-800 dark:text-neutral-300 leading-relaxed">
                    <Markdown>{post.content}</Markdown>
                </div>
            </article>
        </main>
    );
}
