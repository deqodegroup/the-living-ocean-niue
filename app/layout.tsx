import type { Metadata } from "next";
import "./globals.css";

const publicSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://the-living-ocean-niue.pages.dev";

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl),
  title: "ECHO: The Living Ocean — Niue",
  description:
    "Enter Niue's living ocean: a cinematic journey through climate, community, memory and resilience.",
  openGraph: {
    title: "ECHO: The Living Ocean — Niue",
    description: "The ocean is alive. Enter Niue's climate story through a responsive living ecosystem.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "ECHO: The Living Ocean — Niue",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ECHO: The Living Ocean — Niue",
    description: "The ocean is alive. Enter Niue's climate story.",
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
