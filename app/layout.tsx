import type { Metadata } from "next";
import { Source_Serif_4 } from "next/font/google";
import { Providers } from "@/app/providers";
import { ThemeToggle } from "@/app/theme-toggle";
import "./globals.css";

const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-source-serif-4",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${sourceSerif4.variable} font-serif antialiased transition-colors duration-500`}>
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
