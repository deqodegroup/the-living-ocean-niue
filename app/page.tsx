"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ECHO_MEDIA } from "./media-data";
import { SOURCES, SST_ANOMALY_CONTEXT } from "./content-data";
import { VILLAGES } from "./map-data";
import ScrollWorldVideo from "./scroll-world-video";
import styles from "./echo-world.module.css";

const SCENE_STOPS = [0.04, 0.19, 0.37, 0.55, 0.74, 0.93];
const SCENE_BOUNDS = [0.12, 0.29, 0.46, 0.64, 0.83];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function Koru() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className={styles.koruMark}>
      <path d="M94 64c0 22-18 40-40 40S14 86 14 64s18-40 40-40c18 0 32 13 32 29 0 14-11 25-25 25-11 0-20-8-20-18 0-8 7-15 15-15 6 0 11 5 11 11 0 4-3 7-7 7" />
    </svg>
  );
}

function SstSignal() {
  const width = 440;
  const height = 104;
  const min = -0.25;
  const max = 0.95;
  const x = (index: number) => (index / (SST_ANOMALY_CONTEXT.series.length - 1)) * width;
  const y = (value: number) => height - ((value - min) / (max - min)) * height;
  const points = SST_ANOMALY_CONTEXT.series.map((point, index) => `${x(index).toFixed(1)},${y(point.value).toFixed(1)}`).join(" ");
  return (
    <div className={styles.signalCard}>
      <div className={styles.signalHead}><span>Sea surface temperature anomaly</span><strong>+{SST_ANOMALY_CONTEXT.recentDecadeMean.toFixed(2)}°C</strong></div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Niue annual mean sea surface temperature anomalies, 1990 to 2025">
        <line x1="0" y1={y(0)} x2={width} y2={y(0)} className={styles.zeroLine} />
        <polyline points={points} className={styles.sstLine} />
      </svg>
      <div className={styles.signalFoot}><span>1990</span><span>Official SPC dataset</span><span>2025</span></div>
    </div>
  );
}

function FishSchool({ scene }: { scene: number }) {
  const density = [18, 30, 50, 34, 16, 46][scene] ?? 24;
  return (
    <div
      className={styles.fishField}
      aria-hidden="true"
      style={{ transform: "translate3d(var(--fish-drift-x,0px),var(--fish-drift-y,0px),0)" }}
    >
      {Array.from({ length: density }, (_, index) => {
        const x = (index * 37 + scene * 11) % 100;
        const y = 12 + ((index * 53 + scene * 17) % 74);
        const scale = 0.45 + ((index * 7) % 9) / 10;
        const delay = -((index * 0.47 + scene) % 11);
        return <i key={`${scene}-${index}`} className={styles.fish} style={{ "--fx": `${x}%`, "--fy": `${y}%`, "--fs": scale, "--fd": `${delay}s` } as CSSProperties} />;
      })}
    </div>
  );
}

function LivingParticles({ scene }: { scene: number }) {
  return (
    <div className={styles.particles} aria-hidden="true">
      {Array.from({ length: 78 }, (_, index) => (
        <i key={index} style={{
          "--px": `${(index * 47 + scene * 9) % 100}%`,
          "--py": `${(index * 71 + 7) % 100}%`,
          "--ps": `${1 + (index % 4)}px`,
          "--pd": `${-((index * .61) % 13)}s`,
          "--pc": `${index % 3}`,
        } as CSSProperties} />
      ))}
    </div>
  );
}

function EchoGuide({ scene, progress, entered }: { scene: number; progress: number; entered: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let x = 50;
    let y = 52;
    const anchors = [[50, 52], [66, 42], [43, 56], [68, 48], [31, 61], [61, 55]];
    const draw = (time: number) => {
      const root = document.documentElement;
      const px = Number(root.style.getPropertyValue("--echo-pointer-x") || 50);
      const py = Number(root.style.getPropertyValue("--echo-pointer-y") || 50);
      const [ax, ay] = anchors[scene] ?? anchors[0];
      const scrollSurge = Math.sin(progress * Math.PI * 12) * 2.3;
      const tx = ax + (px - 50) * 0.075 + Math.sin(time / 1450 + scene) * 3.4 + scrollSurge;
      const ty = ay + (py - 50) * 0.055 + Math.cos(time / 1800 + scene) * 2.4;
      x += (tx - x) * 0.032;
      y += (ty - y) * 0.032;
      node.style.transform = `translate3d(${x}vw,${y}vh,0) translate(-50%,-50%)`;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [scene, progress]);
  return (
    <div ref={ref} className={`${styles.echo} ${entered ? styles.echoAwake : ""}`} aria-hidden="true">
      <span className={styles.echoWake} />
      <span className={styles.echoHaloA} /><span className={styles.echoHaloB} />
      <span className={styles.echoCore} /><span className={styles.echoComet} />
    </div>
  );
}

function VillageSignal({ onDiscover }: { onDiscover: () => void }) {
  const village = VILLAGES.find((v) => v.name === "Alofi South") ?? VILLAGES[0];
  return (
    <button className={styles.villageSignal} onPointerEnter={onDiscover} onFocus={onDiscover} onClick={onDiscover}>
      <span>Memory awakened</span>
      <strong>{village.name}</strong>
      <em>{village.population} people · 2022 Census</em>
    </button>
  );
}

function Sources({ close }: { close: () => void }) {
  return (
    <div className={styles.sourceBackdrop} onPointerDown={close} role="presentation">
      <section className={styles.sourcePanel} role="dialog" aria-modal="true" aria-label="Data sources" onPointerDown={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={close}>Close</button>
        <p className={styles.eyebrow}>Data transparency</p><h2>Every signal is traceable.</h2>
        <div className={styles.sourceList}>{SOURCES.map((source) => <article key={source.title}><small>{source.publisher} · {source.year}</small><h3>{source.title}</h3><p>{source.indicator}</p><a href={source.url} target="_blank" rel="noreferrer">Open source ↗</a></article>)}</div>
        <p className={styles.creationNote}>Concept, data selection, interpretation and final editorial judgement are the entrant&apos;s. AI tools supported coding, copy refinement and visual implementation.</p>
      </section>
    </div>
  );
}

export default function Home() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [entered, setEntered] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [discovered, setDiscovered] = useState(false);
  const activeScene = useMemo(() => {
    if (progress < SCENE_BOUNDS[0]) return 0;
    if (progress < SCENE_BOUNDS[1]) return 1;
    if (progress < SCENE_BOUNDS[2]) return 2;
    if (progress < SCENE_BOUNDS[3]) return 3;
    if (progress < SCENE_BOUNDS[4]) return 4;
    return 5;
  }, [progress]);

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
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
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
      root.style.setProperty("--parallax-x", `${(50 - px) * .11}px`);
      root.style.setProperty("--parallax-y", `${(50 - py) * .075}px`);
      root.style.setProperty("--fish-drift-x", `${(50 - px) * .05}px`);
      root.style.setProperty("--fish-drift-y", `${(50 - py) * .035}px`);

      // Reef discovery is now environmental: investigate the living school and the data wakes up.
      if (activeScene === 2 && px > 28 && px < 78 && py > 22 && py < 80) setDiscovered(true);
      if (activeScene === 4 && px > 18 && px < 72 && py > 24 && py < 84) setDiscovered(true);
    };
    const pointer = (e: PointerEvent) => move(e.clientX, e.clientY);
    const touch = (e: TouchEvent) => { if (e.touches[0]) move(e.touches[0].clientX, e.touches[0].clientY); };
    window.addEventListener("pointermove", pointer, { passive: true });
    window.addEventListener("touchmove", touch, { passive: true });
    return () => { window.removeEventListener("pointermove", pointer); window.removeEventListener("touchmove", touch); };
  }, [activeScene]);

  useEffect(() => {
    // Preserve discoverability for keyboard/reduced-interaction users without making a button the primary mechanic.
    if (activeScene === 2 && progress > 0.40) setDiscovered(true);
  }, [activeScene, progress]);

  const travelTo = (value: number) => {
    const track = trackRef.current;
    if (!track) return;
    const top = window.scrollY + track.getBoundingClientRect().top;
    const distance = track.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + distance * value, behavior: "smooth" });
  };

  const enter = () => {
    setEntered(true);
    setTimeout(() => travelTo(.16), 220);
  };

  return (
    <main className={styles.world}>
      <div ref={trackRef} className={styles.track}>
        <div className={styles.camera}>
          <ScrollWorldVideo scene={activeScene} progress={progress} />
          <LivingParticles scene={activeScene} />
          <FishSchool scene={activeScene} />
          <EchoGuide scene={activeScene} progress={progress} entered={entered} />

          <header className={styles.header}><button onClick={() => travelTo(0)} className={styles.brand}>ECHO <span>THE LIVING OCEAN — NIUE</span></button><button className={styles.sourcesButton} onClick={() => setSourcesOpen(true)}>Sources</button></header>

          <nav className={styles.progressNav} aria-label="Journey scenes">{ECHO_MEDIA.map((item, index) => <button key={item.id} className={activeScene === index ? styles.navActive : ""} onClick={() => { setEntered(true); travelTo(SCENE_STOPS[index]); }}><i /><span>{item.title}</span></button>)}</nav>

          <section className={`${styles.overlay} ${activeScene === 0 ? styles.visible : ""}`}>
            <p className={styles.eyebrow}>Pacific Dataviz Challenge 2026</p>
            <h1>ECHO</h1><h2>THE LIVING OCEAN — NIUE</h2>
            <button className={styles.enter} onClick={enter}><span className={styles.koruAura} /><Koru /><strong>TOUCH THE KORU TO ENTER</strong></button>
            <p className={styles.heroLine}>THE OCEAN IS ALIVE</p>
          </section>

          <section className={`${styles.overlay} ${styles.storyLeft} ${activeScene === 1 ? styles.visible : ""}`}>
            <p className={styles.eyebrow}>Dolphin Current</p><h2>Follow the current.</h2><p>ECHO moves with the ocean. Scroll to travel. Move the mouse or touch the water to explore.</p>
          </section>

          <section className={`${styles.overlay} ${styles.storyRight} ${activeScene === 2 ? styles.visible : ""}`}>
            <p className={styles.eyebrow}>Reef Community</p><h2>Life gathers here.</h2><p>Move through the school. The reef reacts — and the signal hidden inside the living ocean reveals itself.</p>
            <button className={styles.discoveryButton} onClick={() => setDiscovered((value) => !value)}>Reveal reef signal</button>
            <div className={`${styles.microSignal} ${discovered ? styles.revealed : ""}`}><strong>+0.58°C</strong><span>Difference between the 1990s mean and the 2016–2025 mean</span></div>
          </section>

          <section className={`${styles.overlay} ${styles.storyLeft} ${activeScene === 3 ? styles.visible : ""}`}>
            <p className={styles.eyebrow}>Changing Ocean</p><h2>The signal is in the water.</h2><p>Across the SPC record, Niue&apos;s 2016–2025 mean sea-surface temperature anomaly is 0.58°C warmer than the 1990s mean.</p><SstSignal />
          </section>

          <section className={`${styles.overlay} ${styles.storyRight} ${activeScene === 4 ? styles.visible : ""}`}>
            <p className={styles.eyebrow}>Memory Cavern</p><h2>People. Place. Memory.</h2><p>ECHO quietens here. Move closer and the island begins to speak.</p><VillageSignal onDiscover={() => setDiscovered(true)} />
          </section>

          <section className={`${styles.overlay} ${styles.storyLeft} ${activeScene === 5 ? styles.visible : ""}`}>
            <p className={styles.eyebrow}>Protected Future</p><h2>Abundance is the destination.</h2><p>A living ocean is not a backdrop. It is food, culture, protection, identity and possibility.</p><button className={styles.finalButton} onClick={() => setSourcesOpen(true)}>Explore the evidence</button>
          </section>

          <div className={styles.scrollLegend}>SCROLL = TRAVEL <i /> MOUSE / TOUCH = EXPLORE <i /> FOLLOW ECHO</div>
        </div>
      </div>
      {sourcesOpen && <Sources close={() => setSourcesOpen(false)} />}
    </main>
  );
}
