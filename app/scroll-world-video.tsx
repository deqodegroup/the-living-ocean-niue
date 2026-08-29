"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { ECHO_MEDIA } from "./media-data";
import styles from "./echo-world.module.css";

// Scroll mechanics adapted from oso95/scroll-world (MIT).
// Source: https://github.com/oso95/scroll-world
// Performance rule for ECHO: only the active scene and the next scene stay
// mounted. Only the active scene plays; the next scene is metadata-preloaded.
// Video panels remain inside the sticky camera so HUD/data always paint above.

const SCENE_BOUNDS = [0.12, 0.29, 0.46, 0.64, 0.83];
const CROSSFADE = 0.085;

const viewportLayer: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  minWidth: "100%",
  minHeight: "100%",
  overflow: "hidden",
  pointerEvents: "none",
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function smooth(value: number) {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
}

function sceneForProgress(progress: number) {
  for (let i = 0; i < SCENE_BOUNDS.length; i += 1) {
    if (progress < SCENE_BOUNDS[i]) return i;
  }
  return ECHO_MEDIA.length - 1;
}

function localProgress(progress: number, index: number) {
  const start = index === 0 ? 0 : SCENE_BOUNDS[index - 1];
  const end = index === ECHO_MEDIA.length - 1 ? 1 : SCENE_BOUNDS[index];
  return clamp((progress - start) / Math.max(0.001, end - start));
}

function panelWeights(progress: number) {
  const weights = Array(ECHO_MEDIA.length).fill(0) as number[];

  for (let i = 0; i < SCENE_BOUNDS.length; i += 1) {
    const boundary = SCENE_BOUNDS[i];
    const start = boundary - CROSSFADE;
    const end = boundary + CROSSFADE;

    if (progress >= start && progress <= end) {
      const t = smooth((progress - start) / Math.max(0.001, end - start));
      weights[i] = 1 - t;
      weights[i + 1] = t;
      return weights;
    }
  }

  weights[sceneForProgress(progress)] = 1;
  return weights;
}

export default function ScrollWorldVideo({ progress, scene }: { progress: number; scene: number }) {
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const current = useRef<number[]>(Array(ECHO_MEDIA.length).fill(0));
  const target = useRef<number[]>(Array(ECHO_MEDIA.length).fill(0));
  const progressRef = useRef(progress);
  const sceneRef = useRef(scene);
  const weights = panelWeights(progress);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    sceneRef.current = scene;

    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;

      if (index === scene) {
        try {
          const promise = video.play();
          if (promise) promise.catch(() => {});
        } catch {}
      } else {
        video.pause();
      }
    });
  }, [scene]);

  useEffect(() => {
    let raf = 0;
    const coarse = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const epsilon = coarse ? 0.08 : 0.024;

    const draw = () => {
      const p = progressRef.current;
      const active = sceneRef.current;
      const next = Math.min(ECHO_MEDIA.length - 1, active + 1);

      for (const index of [active, next]) {
        const video = videoRefs.current[index];
        if (!video || !Number.isFinite(video.duration) || video.duration <= 0 || video.seeking) continue;

        target.current[index] = localProgress(p, index);
        current.current[index] += (target.current[index] - current.current[index]) * (reduce ? 1 : 0.16);
        const time = clamp(current.current[index], 0, 0.995) * video.duration;

        if (Math.abs(video.currentTime - time) > epsilon) {
          try { video.currentTime = time; } catch {}
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const primeActive = () => {
      const video = videoRefs.current[sceneRef.current];
      if (!video) return;
      video.muted = true;
      try {
        const promise = video.play();
        if (promise) promise.catch(() => {});
      } catch {}
    };

    window.addEventListener("pointerdown", primeActive, { passive: true });
    window.addEventListener("touchstart", primeActive, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", primeActive);
      window.removeEventListener("touchstart", primeActive);
    };
  }, []);

  return (
    <div
      className={styles.videoWorld}
      aria-hidden="true"
      data-scene={scene}
      style={{
        ...viewportLayer,
        zIndex: 1,
        background: "transparent",
      }}
    >
      {ECHO_MEDIA.map((item, index) => {
        const isCurrent = index === scene;
        const isNext = index === scene + 1;
        const shouldMount = isCurrent || isNext;
        if (!shouldMount) return null;

        const weight = weights[index];

        return (
          <div
            key={item.id}
            className="echo-scene-panel"
            data-scene-panel={item.id}
            style={{
              ...viewportLayer,
              opacity: weight,
              zIndex: isCurrent ? 3 : 2,
              visibility: "visible",
              transition: "opacity 680ms ease",
              background: "transparent",
            }}
          >
            <video
              ref={(node) => { videoRefs.current[index] = node; }}
              className={styles.sceneVideo}
              src={item.file}
              muted
              autoPlay={isCurrent}
              loop
              playsInline
              preload={isCurrent || isNext ? "metadata" : "none"}
              style={{
                position: "absolute",
                inset: 0,
                display: "block",
                width: "100%",
                height: "100%",
                minWidth: "100%",
                minHeight: "100%",
                objectFit: "cover",
                objectPosition: "center center",
                transformOrigin: "center center",
                transform: `scale(${1.08 + progress * 0.025}) translate3d(var(--parallax-x,0px),var(--parallax-y,0px),0)`,
              }}
            />
          </div>
        );
      })}
      <div className={styles.cinematicGrade} />
      <div className={styles.caustics} />
      <div className={styles.pointerLight} />
    </div>
  );
}
