"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ECHO_MEDIA } from "./media-data";
import styles from "./echo-world.module.css";

// Scroll mechanics adapted from oso95/scroll-world (MIT).
// Source: https://github.com/oso95/scroll-world
// We keep ECHO's existing art direction/UI and use the engine ideas that matter here:
// blob-backed seekable clips, scroll->time scrubbing, coalesced seeks, anticipatory loading,
// iOS priming and guaranteed crossfades with no empty/black hand-off.

const SCENE_BOUNDS = [0.12, 0.29, 0.46, 0.64, 0.83];
const CROSSFADE = 0.055;

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
  const start = index === 0 ? 0 : SCENE_BOUNDS[index - 1] - CROSSFADE;
  const end = index === ECHO_MEDIA.length - 1 ? 1 : SCENE_BOUNDS[index] + CROSSFADE;
  return clamp((progress - start) / Math.max(0.001, end - start));
}

function blendWeights(progress: number, ready: boolean[]) {
  const weights = Array(ECHO_MEDIA.length).fill(0) as number[];

  for (let i = 0; i < SCENE_BOUNDS.length; i += 1) {
    const boundary = SCENE_BOUNDS[i];
    const start = boundary - CROSSFADE;
    const end = boundary + CROSSFADE;
    if (progress >= start && progress <= end) {
      const nextReady = ready[i + 1];
      if (!nextReady) {
        weights[i] = 1;
        return weights;
      }
      const t = smooth((progress - start) / (end - start));
      weights[i] = 1 - t;
      weights[i + 1] = t;
      return weights;
    }
  }

  const active = sceneForProgress(progress);
  if (ready[active]) weights[active] = 1;
  else {
    const fallback = ready.findLastIndex(Boolean);
    weights[fallback >= 0 ? fallback : 0] = 1;
  }
  return weights;
}

export default function ScrollWorldVideo({ progress, scene }: { progress: number; scene: number }) {
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const objectUrls = useRef<Array<string | null>>(Array(ECHO_MEDIA.length).fill(null));
  const loading = useRef<boolean[]>(Array(ECHO_MEDIA.length).fill(false));
  const readyRef = useRef<boolean[]>(Array(ECHO_MEDIA.length).fill(false));
  const current = useRef<number[]>(Array(ECHO_MEDIA.length).fill(0));
  const target = useRef<number[]>(Array(ECHO_MEDIA.length).fill(0));
  const progressRef = useRef(progress);
  const [ready, setReady] = useState<boolean[]>(Array(ECHO_MEDIA.length).fill(false));

  progressRef.current = progress;

  const weights = useMemo(() => blendWeights(progress, ready), [progress, ready]);

  useEffect(() => {
    let cancelled = false;

    const loadClip = async (index: number) => {
      if (index < 0 || index >= ECHO_MEDIA.length || loading.current[index] || objectUrls.current[index]) return;
      loading.current[index] = true;
      try {
        const response = await fetch(ECHO_MEDIA[index].file);
        if (!response.ok) throw new Error(`ECHO media ${index} failed: ${response.status}`);
        const blob = await response.blob();
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        objectUrls.current[index] = url;
        const video = videoRefs.current[index];
        if (!video) return;
        video.src = url;
        video.load();
      } catch {
        loading.current[index] = false;
      }
    };

    // ScrollWorld-style anticipatory loading: current, previous and two scenes ahead.
    [scene - 1, scene, scene + 1, scene + 2].forEach((index) => { void loadClip(index); });

    return () => { cancelled = true; };
  }, [scene]);

  useEffect(() => {
    // Prime the first journey legs immediately so the Koru entry never hands off to black.
    const timer = window.setTimeout(() => {
      [0, 1].forEach((index) => {
        const video = videoRefs.current[index];
        if (video && !video.src) {
          fetch(ECHO_MEDIA[index].file)
            .then((response) => response.ok ? response.blob() : Promise.reject())
            .then((blob) => {
              if (objectUrls.current[index]) return;
              const url = URL.createObjectURL(blob);
              objectUrls.current[index] = url;
              video.src = url;
              video.load();
            })
            .catch(() => {});
        }
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let raf = 0;
    const coarse = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const epsilon = coarse ? 0.02 : 0.008;

    const draw = () => {
      const p = progressRef.current;
      ECHO_MEDIA.forEach((_, index) => {
        target.current[index] = localProgress(p, index);
        const video = videoRefs.current[index];
        if (!video || !readyRef.current[index] || video.seeking) return;
        current.current[index] += (target.current[index] - current.current[index]) * (reduce ? 1 : 0.18);
        const duration = video.duration || 1;
        const time = clamp(current.current[index], 0, 0.999) * duration;
        if (Math.abs(video.currentTime - time) > epsilon) {
          try { video.currentTime = time; } catch {}
        }
      });
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    let primed = false;
    const prime = () => {
      if (primed) return;
      primed = true;
      videoRefs.current.forEach((video) => {
        if (!video) return;
        try {
          const promise = video.play();
          if (promise) promise.then(() => video.pause()).catch(() => {});
        } catch {}
      });
    };
    window.addEventListener("pointerdown", prime, { once: true, passive: true });
    window.addEventListener("touchstart", prime, { once: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", prime);
      window.removeEventListener("touchstart", prime);
    };
  }, []);

  useEffect(() => () => {
    objectUrls.current.forEach((url) => { if (url) URL.revokeObjectURL(url); });
  }, []);

  const markReady = (index: number) => {
    readyRef.current[index] = true;
    setReady((previous) => {
      if (previous[index]) return previous;
      const next = [...previous];
      next[index] = true;
      return next;
    });
  };

  return (
    <div className={styles.videoWorld} aria-hidden="true">
      {ECHO_MEDIA.map((item, index) => (
        <video
          key={item.id}
          ref={(node) => { videoRefs.current[index] = node; }}
          className={styles.sceneVideo}
          muted
          playsInline
          preload="metadata"
          onLoadedData={() => markReady(index)}
          onCanPlay={() => markReady(index)}
          style={{
            opacity: weights[index],
            zIndex: weights[index] > 0 ? 2 + index : 1,
            transition: "none",
            transform: `scale(${1.055 + progress * 0.035}) translate3d(var(--parallax-x,0px),var(--parallax-y,0px),0)`,
          }}
        />
      ))}
      <div className={styles.cinematicGrade} />
      <div className={styles.caustics} />
      <div className={styles.pointerLight} />
    </div>
  );
}
