import type { Metadata } from "next";
import { EB_Garamond } from "next/font/google";
import { Providers } from "./providers";
import { ThemeToggle } from "./theme-toggle";
import "./globals.css";

const garamond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-garamond",
});

export const metadata: Metadata = {
  title: "jojo's thoughts",
  description: "just whatever comes to my mind",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${garamond.variable} font-serif antialiased transition-colors duration-500`}>
        <Providers>
          <main className="max-w-[750px] mx-auto px-6 py-24 md:py-32 font-serif relative">
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
