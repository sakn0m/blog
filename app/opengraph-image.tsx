import { ImageResponse } from "next/og";

export const alt = "jojo's thoughts";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
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
                <div style={{ fontSize: 64, fontWeight: 500, color: "#171717" }}>
                    jojo&apos;s thoughts
                </div>
                <div style={{ fontSize: 28, color: "#a3a3a3", marginTop: 16 }}>
                    just whatever comes to my mind
                </div>
            </div>
        ),
        { ...size }
    );
}
