"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./echo-world.module.css";
import { ECHO_MEDIA } from "./media-data";
import { SOURCES } from "./content-data";
import ScrollWorldVideo from "./scroll-world-video";

const SCENE_STOPS = [0.04, 0.19, 0.37, 0.55, 0.74, 0.93];
const SCENE_BOUNDS = [0.12, 0.29, 0.46, 0.64, 0.83];
const clamp = (n: number) => Math.max(0, Math.min(1, n));

function LivingParticles({ scene }: { scene: number }) {
  const items = useMemo(
    () => Array.from({ length: 34 }, (_, i) => ({ x: (i * 37 + scene * 11) % 100, y: (i * 61 + 17) % 100, s: 1 + (i % 4), d: -((i * 1.7) % 12) })),
    [scene],
  );
  return <div className={styles.particles} aria-hidden="true">{items.map((p, i) => <i key={i} style={{ "--px": `${p.x}%`, "--py": `${p.y}%`, "--ps": `${p.s}px`, "--pd": `${p.d}s` } as React.CSSProperties} />)}</div>;
}

function FishSchool({ scene }: { scene: number }) {
  const fish = useMemo(
    () => Array.from({ length: 18 }, (_, i) => ({ x: (i * 23 + scene * 9) % 100, y: 18 + ((i * 41 + scene * 7) % 66), s: 0.55 + (i % 5) * 0.15, d: -((i * 1.3) % 9) })),
    [scene],
  );
  return <div className={styles.fishField} aria-hidden="true" style={{ transform: "translate3d(var(--fish-drift-x,0px),var(--fish-drift-y,0px),0)" }}>{fish.map((f, i) => <i key={i} className={styles.fish} style={{ "--fx": `${f.x}%`, "--fy": `${f.y}%`, "--fs": f.s, "--fd": `${f.d}s` } as React.CSSProperties} />)}</div>;
}

function EchoGuide({ scene, progress }: { scene: number; progress: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const draw = () => {
      const node = ref.current;
      if (!node) return;
      const px = Number(document.documentElement.style.getPropertyValue("--echo-pointer-x") || 50);
      const py = Number(document.documentElement.style.getPropertyValue("--echo-pointer-y") || 50);
      const baseX = scene % 2 === 0 ? 72 : 28;
      const baseY = scene === 0 ? 48 : scene === 5 ? 32 : 54;
      const x = baseX + (px - 50) * 0.08 + Math.sin(progress * 18) * 2.5;
      const y = baseY + (py - 50) * 0.06 + Math.cos(progress * 14) * 2;
      node.style.transform = `translate3d(${x}vw,${y}vh,0) translate(-50%,-50%)`;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [scene, progress]);
  return <div ref={ref} className={`${styles.echo} ${styles.echoAwake}`} aria-hidden="true"><span className={styles.echoWake} /><span className={styles.echoHaloA} /><span className={styles.echoHaloB} /><span className={styles.echoCore} /><span className={styles.echoComet} /></div>;
}

function Sources({ close }: { close: () => void }) {
  return <div className={styles.sourceBackdrop} onPointerDown={close} role="presentation"><section className={styles.sourcePanel} role="dialog" aria-modal="true" aria-label="Data sources" onPointerDown={(e) => e.stopPropagation()}><button className={styles.close} onClick={close}>Close</button><p className={styles.eyebrow}>Data transparency</p><h2>Every signal is traceable.</h2><div className={styles.sourceList}>{SOURCES.map((source) => <article key={source.title}><small>{source.publisher} · {source.year}</small><h3>{source.title}</h3><p>{source.indicator}</p><a href={source.url} target="_blank" rel="noreferrer">Open source ↗</a></article>)}</div><p className={styles.creationNote}>Concept, data selection, interpretation and final editorial judgement are the entrant&apos;s. AI tools supported coding, copy refinement and visual implementation.</p></section></div>;
}

export default function Home() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const activeScene = useMemo(() => progress < SCENE_BOUNDS[0] ? 0 : progress < SCENE_BOUNDS[1] ? 1 : progress < SCENE_BOUNDS[2] ? 2 : progress < SCENE_BOUNDS[3] ? 3 : progress < SCENE_BOUNDS[4] ? 4 : 5, [progress]);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const travel = Math.max(1, track.offsetHeight - window.innerHeight);
      setProgress(clamp(-rect.top / travel));
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const move = (x: number, y: number) => {
      const root = document.documentElement;
      const px = x / window.innerWidth * 100;
      const py = y / window.innerHeight * 100;
      root.style.setProperty("--echo-pointer-x", String(px));
      root.style.setProperty("--echo-pointer-y", String(py));
      root.style.setProperty("--pointer-x", `${px}%`);
      root.style.setProperty("--pointer-y", `${py}%`);
      root.style.setProperty("--parallax-x", `${(50 - px) * 0.11}px`);
      root.style.setProperty("--parallax-y", `${(50 - py) * 0.075}px`);
      root.style.setProperty("--fish-drift-x", `${(50 - px) * 0.05}px`);
      root.style.setProperty("--fish-drift-y", `${(50 - py) * 0.035}px`);
    };
    const pointer = (e: PointerEvent) => move(e.clientX, e.clientY);
    const touch = (e: TouchEvent) => { if (e.touches[0]) move(e.touches[0].clientX, e.touches[0].clientY); };
    window.addEventListener("pointermove", pointer, { passive: true });
    window.addEventListener("touchmove", touch, { passive: true });
    return () => {
      window.removeEventListener("pointermove", pointer);
      window.removeEventListener("touchmove", touch);
    };
  }, []);

  const travelTo = (value: number) => {
    const track = trackRef.current;
    if (!track) return;
    const top = window.scrollY + track.getBoundingClientRect().top;
    const distance = track.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + distance * value, behavior: "smooth" });
  };

  return <main id="echo-world" className={styles.world}>
    <div id="echo-track" ref={trackRef} className={styles.track}>
      <div id="echo-camera" className={styles.camera}>
        <div id="echo-ocean-layer"><ScrollWorldVideo scene={activeScene} progress={progress} /></div>
        <div id="echo-life-layer"><LivingParticles scene={activeScene} /><FishSchool scene={activeScene} /><EchoGuide scene={activeScene} progress={progress} /></div>
        <div id="echo-ui-layer">
          <header className={styles.header}><button onClick={() => travelTo(0)} className={styles.brand}>ECHO <span>THE LIVING OCEAN — NIUE</span></button><button className={styles.sourcesButton} onClick={() => setSourcesOpen(true)}>Sources</button></header>
          <nav className={styles.progressNav} aria-label="Journey scenes">{ECHO_MEDIA.map((item, index) => <button key={item.id} className={activeScene === index ? styles.navActive : ""} onClick={() => travelTo(SCENE_STOPS[index])}><i /><span>{item.title}</span></button>)}</nav>
          <div className={styles.scrollLegend}>SCROLL = TRAVEL <i /> MOUSE / TOUCH = EXPLORE <i /> FOLLOW ECHO</div>
        </div>
      </div>
    </div>
    {sourcesOpen && <Sources close={() => setSourcesOpen(false)} />}
  </main>;
}
