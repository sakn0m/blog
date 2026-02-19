import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/app/lib/posts";

export const alt = "jojo's thoughts";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "80px",
                    backgroundColor: "#fafafa",
                }}
            >
                <div style={{ fontSize: 56, fontWeight: 500, color: "#171717" }}>
                    {post.title}
                </div>
                <div style={{ fontSize: 24, color: "#a3a3a3", marginTop: 16, fontStyle: "italic" }}>
                    {post.date}
                </div>
            </div>
        ),
        { ...size }
    );
}
