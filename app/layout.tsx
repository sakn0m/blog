import type { Metadata } from "next";
import { EB_Garamond } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const garamond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-garamond",
});

export const metadata: Metadata = {
  title: "Giorgio Vanini | Thoughts",
  description: "Personal Blog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${garamond.variable} font-serif antialiased transition-colors duration-500`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
