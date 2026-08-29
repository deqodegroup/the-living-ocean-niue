import type { Metadata } from "next";
import "./globals.css";

const publicSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://the-living-ocean-niue.pages.dev";

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl),
  title: "ECHO: The Living Ocean — Niue",
  description:
    "An immersive data journey through Niue's living ocean, climate risk, people, place and resilience.",
  openGraph: {
    title: "ECHO: The Living Ocean — Niue",
    description: "Follow ECHO through Niue's climate story, where data, place and memory meet.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "ECHO: The Living Ocean — Niue, data, place and memory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ECHO: The Living Ocean — Niue",
    description: "Follow ECHO through Niue's climate story, where data, place and memory meet.",
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
