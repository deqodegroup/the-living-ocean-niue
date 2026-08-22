"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { VILLAGES } from "./map-data";
import { EXPOSURE_CONTEXT, FINANCE_CONTEXT, OCEAN_CONTEXT, RISK_CONTEXT, SOURCES, SST_ANOMALY_CONTEXT } from "./content-data";

const chapters = ["Enter", "Ocean change", "Loss & damage", "Culture & memory", "Climate finance"];

function money(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(value % 1_000_000 ? 1 : 0)}m`;
  return `$${value.toLocaleString("en-US")}`;
}

function SstChart() {
  const width = 460, height = 108, min = -0.25, max = 0.95;
  const x = (index: number) => (index / (SST_ANOMALY_CONTEXT.series.length - 1)) * width;
  const y = (value: number) => height - ((value - min) / (max - min)) * height;
  const points = SST_ANOMALY_CONTEXT.series.map((point, index) => `${x(index).toFixed(1)},${y(point.value).toFixed(1)}`).join(" ");
  return (
    <div className="sst-chart">
      <div className="sst-chart-head"><span>{SST_ANOMALY_CONTEXT.indicator}</span><strong>+{SST_ANOMALY_CONTEXT.recentDecadeMean.toFixed(2)}{SST_ANOMALY_CONTEXT.unit}<small>2016–2025 average</small></strong></div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Annual mean sea surface temperature anomalies for Niue from ${SST_ANOMALY_CONTEXT.startYear} to ${SST_ANOMALY_CONTEXT.endYear}`}>
        <defs><linearGradient id="sst-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff9c7d" stopOpacity=".42" /><stop offset="1" stopColor="#5be9ff" stopOpacity=".02" /></linearGradient></defs>
        <line className="sst-zero" x1="0" y1={y(0)} x2={width} y2={y(0)} />
        <polygon className="sst-area" points={`0,${height} ${points} ${width},${height}`} />
        <polyline className="sst-line" points={points} />
        {SST_ANOMALY_CONTEXT.series.map((point, index) => <circle key={point.year} className="sst-point" cx={x(index)} cy={y(point.value)} r={index === SST_ANOMALY_CONTEXT.series.length - 1 ? 3 : 1.25}><title>{point.year}: {point.value > 0 ? "+" : ""}{point.value.toFixed(1)}°C</title></circle>)}
      </svg>
      <div className="sst-years"><span>{SST_ANOMALY_CONTEXT.startYear}</span><span>Official 2026 SPC dataset</span><span>{SST_ANOMALY_CONTEXT.endYear}</span></div>
      <p>1990s average <strong>+{SST_ANOMALY_CONTEXT.ninetiesMean.toFixed(2)}°C</strong><i />2016–2025 average <strong>+{SST_ANOMALY_CONTEXT.recentDecadeMean.toFixed(2)}°C</strong></p>
    </div>
  );
}

function Koru() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className="koru-mark">
      <path d="M94 64c0 22-18 40-40 40S14 86 14 64s18-40 40-40c18 0 32 13 32 29 0 14-11 25-25 25-11 0-20-8-20-18 0-8 7-15 15-15 6 0 11 5 11 11 0 4-3 7-7 7" />
    </svg>
  );
}

function OceanEnvironment({ progress }: { progress: number }) {
  return (
    <div className="ocean-environment" aria-hidden="true" style={{ "--travel": progress } as CSSProperties}>
      <div className="surface-light" />
      <div className="light-shaft shaft-one" />
      <div className="light-shaft shaft-two" />
      <div className="deep-haze" />
      <div className="reef reef-left" />
      <div className="reef reef-right" />
      <div className="contour-field contour-a" />
      <div className="contour-field contour-b" />
      <div className="pointer-aura" />
      {Array.from({ length: 34 }, (_, index) => (
        <i className="world-particle" key={index} style={{
          "--x": `${(index * 37 + 9) % 100}%`, "--y": `${(index * 61 + 13) % 100}%`,
          "--delay": `${(index % 9) * -1.1}s`, "--size": `${1 + (index % 3)}px`, "--drift": `${(index % 7) - 3}`,
        } as CSSProperties} />
      ))}
    </div>
  );
}

function Echo({ scene, entered }: { scene: number; entered: boolean }) {
  const echoRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = echoRef.current;
    if (!node) return;
    let frame = 0, x = 50, y = 53;
    const destinations = [[50, 52], [66, 49], [52, 44], [29, 60], [62, 67]];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const [restX, restY] = destinations[scene] ?? destinations[0];
      node.style.transform = `translate3d(${restX}vw, ${restY}vh, 0) translate(-50%, -50%)`;
      return;
    }
    const move = (time: number) => {
      const root = document.documentElement;
      const px = Number(root.style.getPropertyValue("--pointer-x-value") || 50);
      const py = Number(root.style.getPropertyValue("--pointer-y-value") || 50);
      const [leadX, leadY] = destinations[scene] ?? destinations[0];
      const magnet = scene === 2 ? .08 : .14;
      const targetX = leadX + (px - 50) * magnet + Math.sin(time / 1900 + scene) * 4;
      const targetY = leadY + (py - 50) * magnet + Math.cos(time / 2300 + scene) * 3;
      x += (targetX - x) * .025; y += (targetY - y) * .025;
      node.style.transform = `translate3d(${x}vw, ${y}vh, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(move);
    };
    frame = requestAnimationFrame(move);
    return () => cancelAnimationFrame(frame);
  }, [scene]);
  return (
    <div ref={echoRef} className={`echo-being ${entered ? "awake" : ""}`} aria-hidden="true">
      <span className="echo-halo halo-one" /><span className="echo-halo halo-two" /><span className="echo-core" />
      <span className="echo-tail tail-one" /><span className="echo-tail tail-two" /><span className="echo-signal" />
    </div>
  );
}

function NiueMap({ selected, onSelect, onDiscover, active }: { selected: string; onSelect: (name: string) => void; onDiscover: (name: string) => void; active: boolean }) {
  return (
    <div className={`map-shell ${active ? "map-awake" : ""}`}>
      <div className="map-rings" aria-hidden="true" /><div className="map-pulse" aria-hidden="true" />
      <svg viewBox="55 45 570 680" className="niue-map" role="group" aria-label="Interactive map of Niue's 14 villages">
        <g transform="translate(0 492)">
          {VILLAGES.map((village) => (
            <path key={village.name} d={village.path} className={selected === village.name ? "village selected" : "village"}
              role="button" tabIndex={active ? 0 : -1} aria-label={`${village.name}, ${village.population} people on census night in 2022`}
              onPointerEnter={() => onDiscover(village.name)} onFocus={() => onDiscover(village.name)}
              onClick={() => onSelect(village.name)} onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(village.name); }
              }}><title>{village.name}</title></path>
          ))}
        </g>
      </svg>
    </div>
  );
}

function Scene({ index, active, progress, children, className = "" }: { index: number; active: boolean; progress: number; children: ReactNode; className?: string }) {
  const centers = [.03, .23, .46, .69, .91];
  return (
    <section id={`chapter-${index}`} className={`world-scene scene-${index} ${className} ${active ? "is-active" : ""}`}
      aria-hidden={!active} style={{ "--scene-shift": progress - centers[index] } as CSSProperties}>{children}</section>
  );
}

function SourcePanel({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { closeRef.current?.focus(); }, []);

  return (
    <div className="source-backdrop" role="presentation" onPointerDown={onClose}>
      <section className="source-panel" role="dialog" aria-modal="true" aria-labelledby="methodology-title" aria-describedby="methodology-intro" onPointerDown={(event) => event.stopPropagation()}>
        <button ref={closeRef} className="source-close" onClick={onClose} aria-label="Close methodology">Close</button>
        <p className="eyebrow">Data transparency</p><h2 id="methodology-title">Data &amp; methodology</h2>
        <p className="source-intro" id="methodology-intro">Every number shown is traceable. Where a village-level value could not be verified, the experience keeps it undisclosed rather than estimating it.</p>
        <div className="source-list">{SOURCES.map((source) => (
          <article key={source.title}><p className="source-publisher">{source.publisher} · {source.year}</p><h3>{source.title}</h3>
            <dl><div><dt>Indicator</dt><dd>{source.indicator}</dd></div><div><dt>Processing</dt><dd>{source.processing}</dd></div></dl>
            <a href={source.url} target="_blank" rel="noreferrer">Open source ↗</a></article>
        ))}</div>
        <div className="creation-note"><strong>Creation note</strong><p>Concept, data selection, interpretation and final editorial judgement are the entrant&apos;s. AI tools supported coding, copy refinement and visual implementation.</p></div>
      </section>
    </div>
  );
}

export default function Home() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false), [progress, setProgress] = useState(0), [activeScene, setActiveScene] = useState(0);
  const [selectedVillage, setSelectedVillage] = useState("Alofi South"), [hoveredVillage, setHoveredVillage] = useState("Alofi South");
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const selected = useMemo(() => VILLAGES.find((v) => v.name === (hoveredVillage || selectedVillage)) ?? VILLAGES[1], [hoveredVillage, selectedVillage]);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const track = trackRef.current; if (!track) return;
      const rect = track.getBoundingClientRect(), travel = Math.max(1, track.offsetHeight - window.innerHeight);
      const next = Math.min(1, Math.max(0, -rect.top / travel)); setProgress(next);
      setActiveScene(next < .13 ? 0 : next < .34 ? 1 : next < .59 ? 2 : next < .8 ? 3 : 4); ticking = false;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    update(); window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);

  useEffect(() => {
    const move = (x: number, y: number) => { const px = x / innerWidth * 100, py = y / innerHeight * 100, root = document.documentElement;
      root.style.setProperty("--pointer-x", `${px}%`); root.style.setProperty("--pointer-y", `${py}%`);
      root.style.setProperty("--pointer-x-value", `${px}`); root.style.setProperty("--pointer-y-value", `${py}`); };
    const pointer = (event: PointerEvent) => move(event.clientX, event.clientY);
    const touch = (event: TouchEvent) => { const point = event.touches[0]; if (point) move(point.clientX, point.clientY); };
    window.addEventListener("pointermove", pointer, { passive: true }); window.addEventListener("touchmove", touch, { passive: true });
    return () => { window.removeEventListener("pointermove", pointer); window.removeEventListener("touchmove", touch); };
  }, []);

  useEffect(() => { const handler = (event: KeyboardEvent) => { if (event.key === "Escape") setSourcesOpen(false); };
    window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler); }, []);

  const travelTo = (value: number) => { const track = trackRef.current; if (!track) return;
    const top = scrollY + track.getBoundingClientRect().top, distance = track.offsetHeight - innerHeight;
    scrollTo({ top: top + distance * value, behavior: "smooth" }); };
  const enter = () => { setEntered(true); setTimeout(() => travelTo(.16), 260); };

  return (
    <main className={`world ${entered ? "entered" : ""}`}>
      <div className="scroll-track" ref={trackRef}><div className="world-camera" style={{ "--travel": progress } as CSSProperties}>
        <OceanEnvironment progress={progress} /><div className="camera-vignette" aria-hidden="true" /><Echo scene={activeScene} entered={entered} />
        <header className="world-header"><button className="wordmark" onClick={() => travelTo(0)} aria-label="Return to the beginning">ECHO <span>Niue&apos;s Living Ocean · 19.05°S 169.92°W</span></button><button className="method-button" onClick={() => setSourcesOpen(true)}>Sources</button></header>
        <nav className="journey-progress" aria-label="Journey progress"><span className="journey-title">Journey</span>{chapters.map((label, index) => (
          <button key={label} onClick={() => { setEntered(true); travelTo([0, .23, .46, .69, .91][index]); }} className={activeScene === index ? "active" : ""} aria-label={`Travel to ${label}`}><i /><span>{label}</span></button>
        ))}</nav>

        <Scene index={0} active={activeScene === 0} progress={progress} className="entry-scene"><div className="entry-copy">
          <p className="eyebrow">Pacific Dataviz Challenge 2026</p><h1>The ocean<br />remembers.</h1><p className="entry-sub">Enter Niue&apos;s Living Ocean. Follow ECHO. Discover the data.</p>
          <button className="enter-button" onClick={enter} aria-label="Enter Niue's Living Ocean"><span className="koru-rings" aria-hidden="true" /><Koru /><strong>Enter</strong></button>
        </div><p className="interaction-legend">Scroll = travel <i /> Mouse / touch = explore</p></Scene>

        <Scene index={1} active={activeScene === 1} progress={progress} className="discovery-scene"><div className="discovery-copy">
          <p className="eyebrow">Ocean change · observed signal</p><h2>The ocean is changing<br />around Niue.</h2><p>Annual temperature anomalies reveal the warming signal beneath year-to-year variation.</p>
          <SstChart />
          <div className="ocean-projection"><strong>{OCEAN_CONTEXT.seaLevelRiseMinCm}–{OCEAN_CONTEXT.seaLevelRiseMaxCm}<small>cm</small></strong><span>projected sea-level rise by {OCEAN_CONTEXT.projectionYear} · {OCEAN_CONTEXT.scenario}</span></div>
          <div className="echo-caption"><i /><span><strong>ECHO reads the change</strong>Niue projects increasing ocean acidification under low, medium and high emissions scenarios this century.</span></div>
        </div><div className="distant-island" aria-hidden="true"><div className="island-surface" /><NiueMap selected="" onSelect={() => undefined} onDiscover={() => undefined} active={false} /></div></Scene>

        <Scene index={2} active={activeScene === 2} progress={progress} className="map-scene"><div className="map-intro">
          <p className="eyebrow">Loss &amp; damage · people and place</p><h2>Risk and people<br />share a map.</h2><p>Explore each village&apos;s verified 2022 census-night population. Population provides spatial context; it is not a village loss estimate.</p>
        </div><NiueMap selected={selectedVillage} onSelect={(name) => { setSelectedVillage(name); setHoveredVillage(name); }} onDiscover={setHoveredVillage} active={activeScene === 2} />
          <aside className="data-signal" aria-live="polite"><p className="signal-state">Discovery signal · {selectedVillage === selected.name ? "selected" : "nearby"}</p><h3>{selected.name}</h3>
            <strong className="data-number">{selected.population.toLocaleString("en-US")}</strong><span className="data-label">people on census night · 2022</span>
            <p className="share-line">{((selected.population / EXPOSURE_CONTEXT.censusNightPopulation) * 100).toFixed(1)}% of Niue&apos;s census-night population</p>
            <div className="aal-line"><span>{RISK_CONTEXT.label}</span><strong>{money(RISK_CONTEXT.annualAverageLossUsd)}</strong><em>USD · {RISK_CONTEXT.hazards} · {RISK_CONTEXT.year}</em></div>
            <p className="uncertainty-note">Village loss figures remain undisclosed until their source values can be directly verified.</p></aside>
        </Scene>

        <Scene index={3} active={activeScene === 3} progress={progress} className="memory-scene"><div className="memory-orbit" aria-hidden="true"><span className="orbit orbit-one" /><span className="orbit orbit-two" /><span className="memory-number">{EXPOSURE_CONTEXT.censusNightPopulation.toLocaleString("en-US")}</span><span className="memory-label">people counted on census night · 2022</span></div>
          <div className="memory-copy"><p className="eyebrow">Culture &amp; memory · people and place</p><h2>Not everything at risk<br />can be priced.</h2><p className="memory-statement">Loss reaches places people live, work, remember and depend upon.</p>
            <dl className="exposure-line"><div><dt>{EXPOSURE_CONTEXT.buildings.toLocaleString("en-US")}</dt><dd>buildings in the 2010 exposure inventory</dd></div><div><dt>{EXPOSURE_CONTEXT.majorCropsHectares.toLocaleString("en-US")} ha</dt><dd>major crops mapped</dd></div><div><dt>{money(EXPOSURE_CONTEXT.replacementValueUsd)}</dt><dd>estimated asset replacement value</dd></div></dl>
            <p className="year-note">Exposure inventory year: 2010 · not a current asset count</p></div>
        </Scene>

        <Scene index={4} active={activeScene === 4} progress={progress} className="future-scene"><div className="finance-paths" aria-hidden="true"><i /><i /><i /><i /></div><div className="future-content">
          <p className="eyebrow">Climate finance · future</p><h2>Resilience requires<br />more than recognition.</h2><div className="finance-focus"><p>One costed ocean action in Niue NDC 3.0</p><strong>{money(FINANCE_CONTEXT.amountUsd)}</strong><span>{FINANCE_CONTEXT.action}</span><em>{FINANCE_CONTEXT.status} · stated need, not confirmed expenditure</em></div>
          <blockquote><span>Data can measure what is at risk.</span><strong>People determine what must endure.</strong></blockquote><button className="method-cta" onClick={() => setSourcesOpen(true)}>View data &amp; methodology <span>↗</span></button></div>
          <footer><span>ECHO · Niue&apos;s Living Ocean</span><span>Data today · resilience tomorrow</span></footer>
        </Scene>
        <div className="travel-meter" aria-hidden="true"><i style={{ transform: `scaleX(${progress})` }} /></div>
      </div></div>
      {sourcesOpen && <SourcePanel onClose={() => setSourcesOpen(false)} />}
    </main>
  );
}
