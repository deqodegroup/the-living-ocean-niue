import type { Metadata } from "next";
import "./globals.css";

const publicSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://the-living-ocean-niue.pages.dev";

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl),
  title: "The Living Ocean — Niue",
  description:
    "An interactive journey through Niue's climate risk, people and resilience data.",
  openGraph: {
    title: "The Living Ocean — Niue",
    description: "Enter Niue's climate story through data, place and memory.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "The Living Ocean — Niue, data, place and memory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Living Ocean — Niue",
    description: "Enter Niue's climate story through data, place and memory.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  );
}
