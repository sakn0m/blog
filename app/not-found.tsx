import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <h1 className="text-3xl font-medium mb-4 text-neutral-900 dark:text-neutral-100">
                not found
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mb-8">
                this page doesn&apos;t exist.
            </p>
            <Link
                href="/"
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
            >
                ← back home
            </Link>
        </div>
    );
}
