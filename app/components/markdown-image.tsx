import Image from "next/image";

export function MarkdownImage({ src, alt, ...props }: React.ComponentProps<"img">) {
    if (!src) return null;

    return (
        <Image
            src={src as string}
            alt={alt || ""}
            width={0}
            height={0}
            sizes="100vw"
            className="w-full h-auto rounded-lg my-8"
            // Cast props to any to avoid type mismatches between HTML img attributes and Next.js Image props
            // while still passing through valid attributes like title, etc.
            {...props as any}
        />
    );
}
