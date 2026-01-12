import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { getAllPosts } from "./lib/posts";

export default function Home() {
  const posts = getAllPosts();

  return (
    <main className="max-w-[750px] mx-auto px-6 py-24 md:py-32 font-serif relative">

      {/* Dark Mode Button (Absolute Position Top Right) */}
      <div className="absolute top-6 right-6 md:top-12 md:right-0">
        <ThemeToggle />
      </div>

      {/* Header */}
      <header className="mb-1">
        <h1 className="text-3xl md:text-4xl font-medium tracking-tight mb-8 dark:text-white">
          jojo's thoughts
        </h1>
        <hr className="border-neutral-200 dark:border-neutral-800" />
      </header>

      {/* Articles Section */}
      <section className="space-y-6">
        <ul className="flex flex-col gap-4">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/posts/${post.slug}`}
                className="group flex flex-row items-baseline justify-between"
              >
                <span className="text-lg text-neutral-800 dark:text-neutral-300 border-b border-transparent group-hover:border-neutral-400 dark:group-hover:border-neutral-500 transition-all">
                  {post.title}
                </span>
                <span className="text-sm text-neutral-400 dark:text-neutral-500 italic">
                  {post.date}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

    </main>
  );
}
