import Image from "next/image";

export function MarkdownImage({ src, alt }: React.ComponentProps<"img">) {
    if (!src) return null;

    return (
        <span className="block relative w-full aspect-video my-8">
            <Image
                src={src as string}
                alt={alt || ""}
                fill
                sizes="(max-width: 750px) 100vw, 750px"
                className="object-cover rounded-lg"
            />
        </span>
    );
}
