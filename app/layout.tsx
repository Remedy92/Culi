import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "TableLink - AI Menu Assistant for Restaurants",
  description: "AI menu assistant that speaks every language. Instant answers about dishes, ingredients, and allergens.",
  keywords: ["restaurant", "AI assistant", "menu", "multilingual", "hospitality"],
  openGraph: {
    title: "TableLink - AI Menu Assistant for Restaurants",
    description: "AI menu assistant that speaks every language. Instant answers about dishes, ingredients, and allergens",
    type: "website",
    locale: "en_US",
    siteName: "TableLink",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
