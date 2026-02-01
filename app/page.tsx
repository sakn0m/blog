import Link from "next/link";

import { getAllPosts } from "./lib/posts";

export default function Home() {
  const posts = getAllPosts();

  return (
    <>
      {/* Header */}
      <header className="mb-1">
        <h1 className="text-3xl md:text-4xl font-medium tracking-tight mb-8 dark:text-white">
          jojo&apos;s thoughts
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
                <span className="text-lg text-neutral-800 dark:text-neutral-300 border-b border-transparent group-hover:border-neutral-400 dark:group-hover:border-neutral-500 group-active:border-neutral-400 dark:group-active:border-neutral-500 transition-all">
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
    </>
  );
}
