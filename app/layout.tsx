import type { Metadata } from "next";
import "./globals.css";
import "./final-polish.css";

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

const heroVideo = "/the-living-ocean-niue/media/01-ocean-wall-github.mp4";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preload" href={heroVideo} as="video" type="video/mp4" />
        <link rel="preload" href="/the-living-ocean-niue/media/echo-hero.png" as="image" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var src='${heroVideo}';function swap(){var v=document.querySelector('video.hero-video');if(!v)return false;if(v.getAttribute('src')!==src){v.setAttribute('poster','/the-living-ocean-niue/media/echo-hero.png');v.setAttribute('src',src);v.load();var p=v.play();if(p&&p.catch)p.catch(function(){});}return true;}if(!swap()){document.addEventListener('DOMContentLoaded',swap,{once:true});var o=new MutationObserver(function(){if(swap())o.disconnect();});o.observe(document.documentElement,{childList:true,subtree:true});setTimeout(function(){o.disconnect();},5000);}})();`,
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
