"use client";

import { useEffect, useRef } from "react";
import { ECHO_MEDIA } from "./media-data";
import styles from "./echo-world.module.css";

// Scroll mechanics adapted from oso95/scroll-world (MIT).
// Source: https://github.com/oso95/scroll-world
// Showcase rule for ECHO: scroll progress directly controls the six full-screen
// video worlds. Do not gate a transition on decoder readiness, because that can
// hold the previous clip and make the journey feel stuck during a live demo.

const SCENE_BOUNDS = [0.12, 0.29, 0.46, 0.64, 0.83];
const CROSSFADE = 0.075;

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

function blendWeights(progress: number) {
  const weights = Array(ECHO_MEDIA.length).fill(0) as number[];

  for (let i = 0; i < SCENE_BOUNDS.length; i += 1) {
    const boundary = SCENE_BOUNDS[i];
    const start = boundary - CROSSFADE;
    const end = boundary + CROSSFADE;
    if (progress >= start && progress <= end) {
      const t = smooth((progress - start) / (end - start));
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
  const readyRef = useRef<boolean[]>(Array(ECHO_MEDIA.length).fill(false));
  const current = useRef<number[]>(Array(ECHO_MEDIA.length).fill(0));
  const target = useRef<number[]>(Array(ECHO_MEDIA.length).fill(0));
  const progressRef = useRef(progress);
  const weights = blendWeights(progress);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    let raf = 0;
    const coarse = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const epsilon = coarse ? 0.025 : 0.008;

    const draw = () => {
      const p = progressRef.current;
      ECHO_MEDIA.forEach((_, index) => {
        target.current[index] = localProgress(p, index);
        const video = videoRefs.current[index];
        if (!video || !readyRef.current[index] || video.seeking) return;
        current.current[index] += (target.current[index] - current.current[index]) * (reduce ? 1 : 0.2);
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

  const markReady = (index: number) => {
    readyRef.current[index] = true;
  };

  return (
    <div className={styles.videoWorld} aria-hidden="true" data-scene={scene}>
      {ECHO_MEDIA.map((item, index) => (
        <video
          key={item.id}
          ref={(node) => { videoRefs.current[index] = node; }}
          className={styles.sceneVideo}
          src={item.file}
          muted
          playsInline
          preload="auto"
          onLoadedData={() => markReady(index)}
          onCanPlay={() => markReady(index)}
          style={{
            opacity: weights[index],
            zIndex: weights[index] > 0 ? 20 + index : 1,
            transition: "opacity 520ms ease",
            transform: `scale(${1.07 + progress * 0.035}) translate3d(var(--parallax-x,0px),var(--parallax-y,0px),0)`,
          }}
        />
      ))}
      <div className={styles.cinematicGrade} />
      <div className={styles.caustics} />
      <div className={styles.pointerLight} />
    </div>
  );
}
