import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "@/app/providers";
import { ThemeToggle } from "@/app/theme-toggle";
import "./globals.css";

const charter = localFont({
  src: [
    { path: "../public/fonts/charter-regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/charter-italic.woff2", weight: "400", style: "italic" },
    { path: "../public/fonts/charter-bold.woff2", weight: "700", style: "normal" },
    { path: "../public/fonts/charter-bold-italic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--font-charter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jojo.news"),
  title: {
    default: "jojo's thoughts",
    template: "%s",
  },
  description: "just whatever comes to my mind",
  openGraph: {
    title: "jojo's thoughts",
    description: "just whatever comes to my mind",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={charter.variable}>
      <body className="font-serif">
        <Providers>
          <main className="max-w-[750px] mx-auto px-6 py-24 md:py-32 relative">
            <div className="absolute top-6 right-6 md:top-12 md:right-0">
              <ThemeToggle />
            </div>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
