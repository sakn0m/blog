import Link from "next/link";
import { ThemeToggle } from "../../theme-toggle";

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    return (
        <main className="max-w-[600px] mx-auto px-6 py-24 md:py-32 font-serif fade-in relative">
            <div className="absolute top-6 right-6 md:top-12 md:right-0">
                <ThemeToggle />
            </div>

            <Link href="/" className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors mb-8 block">
                ← Back
            </Link>

            <article className="prose dark:prose-invert">
                <h1 className="text-3xl font-medium mb-4 capitalize text-neutral-900 dark:text-neutral-100">{slug.replace("-", " ")}</h1>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed font-serif text-lg">
                    This is a placeholder for the article content. In a real application,
                    this would verify the slug and render Markdown/MDX.
                </p>
            </article>
        </main>
    );
}
