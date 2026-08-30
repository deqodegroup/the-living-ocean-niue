import type { Metadata } from "next";
import "./globals.css";
import "./final-polish.css";
import "./hero-priority.css";

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
        <link rel="preload" href={heroVideo} as="video" type="video/mp4" fetchPriority="high" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var src='${heroVideo}';function swap(){var v=document.querySelector('video.hero-video');if(!v)return false;if(v.getAttribute('src')!==src){v.removeAttribute('poster');v.setAttribute('src',src);v.setAttribute('preload','auto');v.setAttribute('autoplay','');v.setAttribute('muted','');v.setAttribute('playsinline','');v.load();}var p=v.play();if(p&&p.catch)p.catch(function(){});return true;}function kick(){swap();requestAnimationFrame(swap);setTimeout(swap,50);setTimeout(swap,200);setTimeout(swap,700);setTimeout(swap,1500);}var o=new MutationObserver(kick);o.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});kick();document.addEventListener('DOMContentLoaded',kick,{once:true});window.addEventListener('load',kick,{once:true});setTimeout(function(){o.disconnect();swap();},6000);})();`,
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
