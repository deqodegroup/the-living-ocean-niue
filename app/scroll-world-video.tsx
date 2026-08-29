"use client";

import { useEffect, useRef } from "react";
import { ECHO_MEDIA } from "./media-data";
import styles from "./echo-world.module.css";

// Scroll mechanics adapted from oso95/scroll-world (MIT).
// Source: https://github.com/oso95/scroll-world
// Showcase rule for ECHO: every scene owns a full-viewport video panel. Scroll
// progress chooses the dominant panel, so the next video is already present as a
// page-scale layer instead of waiting inside a fragile hidden stack.

const SCENE_BOUNDS = [0.12, 0.29, 0.46, 0.64, 0.83];
const CROSSFADE = 0.085;

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
  const weights = panelWeights(progress);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    let raf = 0;
    const coarse = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const epsilon = coarse ? 0.03 : 0.01;

    const draw = () => {
      const p = progressRef.current;

      ECHO_MEDIA.forEach((_, index) => {
        target.current[index] = localProgress(p, index);
        const video = videoRefs.current[index];
        if (!video || !Number.isFinite(video.duration) || video.duration <= 0 || video.seeking) return;

        current.current[index] += (target.current[index] - current.current[index]) * (reduce ? 1 : 0.24);
        const time = clamp(current.current[index], 0, 0.995) * video.duration;

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
          video.muted = true;
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

  return (
    <div className={styles.videoWorld} aria-hidden="true" data-scene={scene}>
      {ECHO_MEDIA.map((item, index) => {
        const weight = weights[index];
        const isNearby = weight > 0 || Math.abs(index - scene) <= 1;

        return (
          <div
            key={item.id}
            className="echo-scene-panel"
            data-scene-panel={item.id}
            style={{
              opacity: weight,
              zIndex: weight > 0 ? 30 + index : 5 + index,
              visibility: isNearby ? "visible" : "hidden",
              transition: "opacity 680ms ease, visibility 680ms ease",
            }}
          >
            <video
              ref={(node) => { videoRefs.current[index] = node; }}
              className={styles.sceneVideo}
              src={item.file}
              muted
              playsInline
              preload="auto"
              poster=""
              style={{
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
