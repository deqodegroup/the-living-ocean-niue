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
        {SST_ANOMALY_CONTEXT.series.map((point, index) => <circle key={point.year} className={`sst-point ${point.year >= 2016 ? "recent" : ""}`} cx={x(index)} cy={y(point.value)} r={index === SST_ANOMALY_CONTEXT.series.length - 1 ? 3 : 1.25}><title>{point.year}: {point.value > 0 ? "+" : ""}{point.value.toFixed(1)}°C</title></circle>)}
      </svg>
      <div className="sst-years"><span>{SST_ANOMALY_CONTEXT.startYear}</span><span>Official 2026 SPC dataset</span><span>{SST_ANOMALY_CONTEXT.endYear}</span></div>
      <p>1990s average <strong>+{SST_ANOMALY_CONTEXT.ninetiesMean.toFixed(2)}°C</strong><i />2016–2025 average <strong>+{SST_ANOMALY_CONTEXT.recentDecadeMean.toFixed(2)}°C</strong></p>
    </div>
  );
}

function Koru() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className="koru-mark">
      <path className="koru-main-path" d="M99 64c0 25-20 44-44 44S11 89 11 65s19-43 43-43c20 0 36 15 36 34 0 17-13 30-30 30-14 0-25-10-25-23 0-11 9-20 20-20 9 0 16 7 16 16 0 7-5 12-12 12" />
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
      <div className="living-current current-one" />
      <div className="living-current current-two" />
      <div className="ocean-heartbeat" />
      <div className="reef reef-left" />
      <div className="reef reef-right" />
      <div className="contour-field contour-a" />
      <div className="contour-field contour-b" />
      <div className="pointer-aura" />
      {Array.from({ length: 58 }, (_, index) => (
        <i className="world-particle" key={index} style={{
          "--x": `${(index * 37 + 9) % 100}%`, "--y": `${(index * 61 + 13) % 100}%`,
          "--delay": `${(index % 9) * -1.1}s`, "--size": `${1 + (index % 3)}px`, "--drift": `${(index % 7) - 3}`,
        } as CSSProperties} />
      ))}
    </div>
  );
}

function NiueMap({ selected, onSelect, onDiscover, active, reveal = false }: { selected: string; onSelect: (name: string) => void; onDiscover: (name: string) => void; active: boolean; reveal?: boolean }) {
  return (
    <div className={`map-shell ${active ? "map-awake" : ""} ${reveal ? "reveal-map" : ""}`}>
      <div className="map-rings" aria-hidden="true" />
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

function Scene({ index, active, visited, progress, children, className = "" }: { index: number; active: boolean; visited: boolean; progress: number; children: ReactNode; className?: string }) {
  const centers = [.03, .23, .46, .69, .91];
  return (
    <section id={`chapter-${index}`} className={`world-scene scene-${index} ${className} ${active ? "is-active" : ""} ${visited ? "is-visited" : ""}`}
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
        <div className="context-panels">
          <article className="context-panel">
            <p className="context-label">Why this exists</p>
            <p>Climate data on Niue is scattered — official statistics, disaster assessments and community knowledge rarely sit in one place, and rarely speak in a register anyone outside a report can feel.</p>
            <p>The Living Ocean — Niue puts verified ocean-change, loss and exposure data next to the people and villages it describes — without inflating what the numbers can and can&apos;t say. Recognition of a problem in policy is not the same as resilience on the ground. This piece tries to hold both truths at once.</p>
          </article>
          <article className="context-panel">
            <p className="context-label">On the making of this piece</p>
            <p>The data selection, framing and editorial choices in The Living Ocean — Niue are the work of DEQODE Group and Oma Tafua. AI tools supported build and iteration; every dataset, caveat and narrative decision was made by the team, not generated by the tool.</p>
            <p className="context-caveat">Where a figure could not be independently verified, it was left out rather than estimated.</p>
          </article>
        </div>
        <div className="source-split" aria-label="Dataset categories">
          <section className="source-tier official-tier">
            <p className="source-tier-label">Official 2026 Challenge dataset</p>
            <h3>Mean sea surface temperature anomalies (SST_ANOM)</h3>
            <p>Pacific Data Hub · .Stat Explorer · Pacific Community (SPC)</p>
            <em>Used directly — 36 annual readings, 1990–2025.</em>
          </section>
          <section className="source-tier supplementary-tier">
            <p className="source-tier-label">Supplementary open data</p>
            <p>Used alongside the official dataset, per Challenge rules (open data, cited below).</p>
            <ul>
              <li>Niue Population and Housing Census, 2022 (Niue Statistics Office)</li>
              <li>Pacific Catastrophe Risk Assessment (PCRAFI), disaster loss estimates, 2011</li>
              <li>Niue Exposure Inventory, 2010 (buildings, crops, asset replacement value)</li>
              <li>Niue Nationally Determined Contribution (NDC) 3.0, UNFCCC registry</li>
            </ul>
          </section>
        </div>
        <p className="source-detail-label">Detailed source record</p>
        <div className="source-list">{SOURCES.map((source) => (
          <article key={source.title}><p className="source-publisher">{source.publisher} · {source.year}</p><h3>{source.title}</h3>
            <dl><div><dt>Indicator</dt><dd>{source.indicator}</dd></div><div><dt>Processing</dt><dd>{source.processing}</dd></div></dl>
            <a href={source.url} target="_blank" rel="noreferrer">Open source</a></article>
        ))}</div>
      </section>
    </div>
  );
}

export default function Home() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false), [awakening, setAwakening] = useState(false), [progress, setProgress] = useState(0), [activeScene, setActiveScene] = useState(0);
  const [visitedScenes, setVisitedScenes] = useState<number[]>([0]);
  const [selectedVillage, setSelectedVillage] = useState("Alofi South"), [hoveredVillage, setHoveredVillage] = useState("Alofi South");
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const selected = useMemo(() => VILLAGES.find((v) => v.name === (hoveredVillage || selectedVillage)) ?? VILLAGES[1], [hoveredVillage, selectedVillage]);

  useEffect(() => { setVisitedScenes((seen) => seen.includes(activeScene) ? seen : [...seen, activeScene]); }, [activeScene]);

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
      root.style.setProperty("--pointer-x-value", `${px}`); root.style.setProperty("--pointer-y-value", `${py}`);
      root.style.setProperty("--scene-parallax-x", `${(50 - px) * .12}px`); root.style.setProperty("--scene-parallax-y", `${(50 - py) * .08}px`); };
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
  const returnHome = () => {
    setEntered(false);
    setAwakening(false);
    travelTo(0);
  };
  const travelToChapter = (index: number) => {
    if (index === 0) { returnHome(); return; }
    setAwakening(false);
    setEntered(true);
    travelTo([0, .23, .46, .69, .91][index]);
  };
  const enter = () => {
    if (awakening) return;
    setAwakening(true);
    setTimeout(() => { setEntered(true); setAwakening(false); travelTo(.16); }, 820);
  };

  return (
    <main className={`world ${entered ? "entered" : ""} ${awakening ? "awakening" : ""}`} data-scene={activeScene}>
      <div className="scroll-track" ref={trackRef}><div className="world-camera" style={{ "--travel": progress } as CSSProperties}>
        <OceanEnvironment progress={progress} /><div className="camera-vignette" aria-hidden="true" />
        <header className="world-header"><button className="wordmark" onClick={returnHome} aria-label="Return to the beginning"><span className="wordmark-copy"><b>ECHO</b><small>THE LIVING OCEAN — NIUE</small></span></button><button className="method-button" onClick={() => setSourcesOpen(true)}>Sources</button></header>
        <nav className="journey-progress" aria-label="Journey progress"><span className="journey-title">Journey</span>{chapters.map((label, index) => (
          <button key={label} onClick={() => travelToChapter(index)} className={activeScene === index ? "active" : ""} aria-label={`Travel to ${label}`}><i /><span>{label}</span></button>
        ))}</nav>

        <Scene index={0} active={activeScene === 0} visited={visitedScenes.includes(0)} progress={progress} className="entry-scene"><video className="hero-video" src="/media/01-ocean-wall-github.mp4" autoPlay muted loop playsInline preload="auto" aria-hidden="true" /><div className="scene-image opening-image" aria-hidden="true" /><div className="entry-copy">
          <p className="eyebrow">Pacific Dataviz Challenge 2026</p><h1><span>ECHO</span><br />THE LIVING<br />OCEAN <em>— NIUE</em></h1><p className="entry-purpose">Niue&apos;s changing ocean. The people and places it reaches. The choices still ahead.</p>
        </div><div className="entry-koru-stage"><button className="enter-button" onClick={enter} aria-label="Enter through the koru and begin the journey through Niue's Living Ocean"><span className="koru-rings" aria-hidden="true" /><Koru /><strong>Touch the Koru to enter</strong></button></div><div className="hero-credit"><span>A collaboration between DEQODE Group and Oma Tafua.</span><span>Built for the Pacific Community (SPC) Dataviz Challenge 2026.</span></div></Scene>

        <Scene index={1} active={activeScene === 1} visited={visitedScenes.includes(1)} progress={progress} className="discovery-scene"><div className="scene-image ocean-change-image" aria-hidden="true" /><div className="scene-current current-warm" aria-hidden="true" /><div className="discovery-copy">
          <p className="eyebrow reveal-label">01 · Ocean change · observed signal</p><h2 className="reveal-title">Niue&apos;s ocean<br />is changing.</h2><p className="journey-purpose reveal-copy">This living data journey connects ocean change with village risk, cultural memory and the climate action that could protect what endures.</p>
          <div className="evidence-table ocean-evidence reveal-panel"><SstChart />
            <div className="ocean-projection evidence-row reveal-data"><strong>{OCEAN_CONTEXT.seaLevelRiseMinCm}–{OCEAN_CONTEXT.seaLevelRiseMaxCm}<small>cm</small></strong><span>projected sea-level rise by {OCEAN_CONTEXT.projectionYear}<em>{OCEAN_CONTEXT.scenario} · {OCEAN_CONTEXT.source}</em></span></div>
            <div className="echo-caption evidence-row reveal-source"><i /><span><strong>ECHO reads the change</strong>Niue projects increasing ocean acidification under low, medium and high emissions scenarios this century.</span></div>
          </div>
        </div><div className="distant-island" aria-hidden="true"><div className="island-surface" /><NiueMap selected="" onSelect={() => undefined} onDiscover={() => undefined} active={false} /></div></Scene>

        <Scene index={2} active={activeScene === 2} visited={visitedScenes.includes(2)} progress={progress} className="map-scene"><div className="scene-image loss-damage-image" aria-hidden="true" /><div className="storm-trace" aria-hidden="true"><i /><i /><i /></div><div className="map-intro">
          <p className="eyebrow reveal-label">02 · Loss &amp; damage · people and place</p><h2 className="reveal-title">Every number<br />lives somewhere.</h2><p className="reveal-copy">Touch a village to reveal its verified 2022 census-night population. These counts give risk a human geography; they are not village loss estimates.</p>
        </div><NiueMap selected={selectedVillage} onSelect={(name) => { setSelectedVillage(name); setHoveredVillage(name); }} onDiscover={setHoveredVillage} active={activeScene === 2} reveal />
          <aside className="data-signal evidence-table reveal-panel" aria-live="polite"><p className="signal-state">Discovery signal · {selectedVillage === selected.name ? "selected" : "nearby"}</p><h3>{selected.name}</h3>
            <strong className="data-number">{selected.population.toLocaleString("en-US")}</strong><span className="data-label">people on census night · 2022</span>
            <p className="share-line">{((selected.population / EXPOSURE_CONTEXT.censusNightPopulation) * 100).toFixed(1)}% of Niue&apos;s census-night population</p>
            <div className="aal-line"><strong>{money(RISK_CONTEXT.annualAverageLossUsd)} USD</strong><span>National annual average direct loss, earthquakes and tropical cyclones</span><em>Source: Pacific Catastrophe Risk Assessment and Financing Initiative (PCRAFI), 2011</em></div>
            <p className="uncertainty-note">Village loss figures remain undisclosed until their source values can be directly verified.</p></aside>
        </Scene>

        <Scene index={3} active={activeScene === 3} visited={visitedScenes.includes(3)} progress={progress} className="memory-scene"><div className="scene-image culture-memory-image" aria-hidden="true" /><div className="memory-orbit" aria-hidden="true"><span className="orbit orbit-one" /><span className="orbit orbit-two" /><span className="memory-number">{EXPOSURE_CONTEXT.censusNightPopulation.toLocaleString("en-US")}</span><span className="memory-label">people counted on census night · 2022</span></div>
          <div className="memory-copy"><p className="eyebrow reveal-label">03 · Culture &amp; memory · what value cannot hold</p><h2 className="reveal-title">A place is more than<br />its rebuild cost.</h2><p className="memory-statement reveal-copy">Loss can reach homes, crops, livelihoods, memory and the places that hold belonging.</p>
            <div className="evidence-table memory-evidence reveal-panel"><dl className="exposure-line"><div><dt>{EXPOSURE_CONTEXT.buildings.toLocaleString("en-US")}</dt><dd>buildings in the 2010 exposure inventory</dd></div><div><dt>{EXPOSURE_CONTEXT.majorCropsHectares.toLocaleString("en-US")} ha</dt><dd>major crops mapped</dd></div><div><dt>{money(EXPOSURE_CONTEXT.replacementValueUsd)}</dt><dd>estimated asset replacement value</dd></div></dl>
              <p className="year-note">Context, not a current count · exposure inventory dated 2010</p></div></div>
        </Scene>

        <Scene index={4} active={activeScene === 4} visited={visitedScenes.includes(4)} progress={progress} className="future-scene"><div className="scene-image future-image" aria-hidden="true" /><div className="finance-paths" aria-hidden="true"><i /><i /><i /><i /></div><div className="future-content">
          <p className="eyebrow reveal-label">04 · Climate finance · the choice ahead</p><h2 className="reveal-title">Recognition is not<br />resilience.</h2><div className="finance-evidence evidence-table reveal-panel"><div className="finance-journey" aria-label="The climate finance pathway"><span>Need recognised</span><i /><span>Action costed</span><i /><span>Delivery conditional</span></div><div className="finance-focus"><p>One possible response · Niue NDC 3.0</p><strong>{money(FINANCE_CONTEXT.amountUsd)}</strong><span>{FINANCE_CONTEXT.action}</span><em>{FINANCE_CONTEXT.status} · stated need, not confirmed expenditure</em></div></div>
          <blockquote><span>Data shows what is changing.</span><strong>People decide what the future refuses to lose.</strong></blockquote><button className="method-cta" onClick={() => setSourcesOpen(true)}>Trace every number</button></div>
          <footer className="closing-footer">
            <div className="credit-block">
              <p>A collaboration between DEQODE Group and Oma Tafua.</p>
              <p>Built for the Pacific Community (SPC) Dataviz Challenge 2026.</p>
              <p>Niue · 2026</p>
            </div>
            <div className="footer-signoff"><span>ECHO · Niue&apos;s Living Ocean</span><span>Listen · learn · choose what endures</span></div>
          </footer>
        </Scene>
        <div className="travel-meter" aria-hidden="true"><i style={{ transform: `scaleX(${progress})` }} /></div>
      </div></div>
      {sourcesOpen && <SourcePanel onClose={() => setSourcesOpen(false)} />}
    </main>
  );
}
