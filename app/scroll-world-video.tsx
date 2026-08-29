"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ECHO_MEDIA } from "./media-data";
import styles from "./echo-world.module.css";

// Scroll mechanics adapted from oso95/scroll-world (MIT).
// Source: https://github.com/oso95/scroll-world
// ECHO keeps its own art direction/UI while using the engine ideas that matter here:
// scroll->time scrubbing, coalesced seeks, anticipatory loading, iOS priming and
// readiness-gated crossfades so the outgoing ocean never disappears before the next is ready.

const SCENE_BOUNDS = [0.12, 0.29, 0.46, 0.64, 0.83];
const CROSSFADE = 0.06;

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
      if (!ready[i + 1]) {
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
  if (ready[active]) {
    weights[active] = 1;
    return weights;
  }

  for (let offset = 1; offset < ECHO_MEDIA.length; offset += 1) {
    const previous = active - offset;
    if (previous >= 0 && ready[previous]) {
      weights[previous] = 1;
      return weights;
    }
    const next = active + offset;
    if (next < ECHO_MEDIA.length && ready[next]) {
      weights[next] = 1;
      return weights;
    }
  }

  // Keep the first ocean layer present while the decoder paints its first frame.
  weights[0] = 1;
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

  const weights = useMemo(() => blendWeights(progress, ready), [progress, ready]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

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
        const video = videoRefs.current[index];
        if (!video || readyRef.current[index]) {
          URL.revokeObjectURL(url);
          return;
        }
        objectUrls.current[index] = url;
        video.src = url;
        video.load();
      } catch {
        loading.current[index] = false;
      }
    };

    // Current, previous and two scenes ahead: enough buffer for fast scroll without loading all 45 MB at once.
    [scene - 1, scene, scene + 1, scene + 2].forEach((index) => { void loadClip(index); });
    return () => { cancelled = true; };
  }, [scene]);

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
          src={item.file}
          muted
          playsInline
          preload={Math.abs(index - scene) <= 2 ? "auto" : "metadata"}
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
