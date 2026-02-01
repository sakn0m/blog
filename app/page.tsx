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
                <span className="text-lg text-neutral-800 dark:text-neutral-300 underline decoration-transparent decoration-1 underline-offset-[4px] md:group-hover:decoration-neutral-400 md:dark:group-hover:decoration-neutral-500 group-active:decoration-neutral-400 dark:group-active:decoration-neutral-500 transition-colors duration-450 md:duration-150 ease-out group-active:duration-0">
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
