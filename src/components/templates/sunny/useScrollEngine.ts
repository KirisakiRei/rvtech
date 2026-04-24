import { useEffect, useRef } from 'react';
import type { Scene } from './SceneConfig';

export type ScrollEngineProps = {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  stageRef: React.RefObject<HTMLDivElement | null>;
  scenes: Scene[];
};

export const useScrollEngine = ({ scrollContainerRef, stageRef, scenes }: ScrollEngineProps) => {
  const currentSceneIndex = useRef(0);
  const currentScrollProgress = useRef(0);
  const targetScrollProgress = useRef(0);
  const isScrolling = useRef(false);
  const elementsCache = useRef<Map<string, HTMLElement>>(new Map());

  // Extracted core calculation for interpolation
  const getValueAtProgress = (
    keyframes: { progress: number; x?: number; y?: number; scale?: number; rotate?: number; opacity?: number }[],
    progress: number,
    sceneSpeed: number
  ) => {
    let before = keyframes[0];
    let after = keyframes[keyframes.length - 1];

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (progress >= keyframes[i].progress && progress <= keyframes[i + 1].progress) {
        before = keyframes[i];
        after = keyframes[i + 1];
        break;
      }
    }

    if (progress <= before.progress) return before;
    if (progress >= after.progress) return after;

    const range = after.progress - before.progress;
    const p = (progress - before.progress) / range;
    const speedAdjustedP = Math.pow(p, sceneSpeed);

    const interpolate = (prop: 'x' | 'y' | 'scale' | 'rotate' | 'opacity') => {
      const getDef = (prop: string) => (prop === 'scale' || prop === 'opacity' ? 1 : 0);
      const valB = before[prop] ?? getDef(prop);
      const valA = after[prop] ?? getDef(prop);

      return valB + (valA - valB) * speedAdjustedP;
    };

    return {
      x: interpolate('x'),
      y: interpolate('y'),
      scale: interpolate('scale'),
      rotate: interpolate('rotate'),
      opacity: interpolate('opacity'),
    };
  };

  const updateSceneProgress = (progress: number) => {
    currentSceneIndex.current = Math.floor(progress);
    const sceneProgress = progress - currentSceneIndex.current;
    const currentScene = scenes[currentSceneIndex.current];

    if (!currentScene) return;

    Object.entries(currentScene).forEach(([elementId, config]) => {
      // @ts-ignore
      if (!config.keyframes) return;

      if (!elementsCache.current.has(elementId) && stageRef.current) {
        const el = stageRef.current.querySelector<HTMLElement>(`[data-anim-id="${elementId}"]`);
        if (el) elementsCache.current.set(elementId, el);
      }

      const el = elementsCache.current.get(elementId);
      if (!el) return;

      // @ts-ignore
      const values = getValueAtProgress(config.keyframes, sceneProgress, config.speed || 1);
      
      const opacity = values.opacity ?? 1;
      el.style.transform = `translate(${values.x}px, ${values.y}px) scale(${values.scale}) rotate(${values.rotate}deg)`;
      el.style.opacity = opacity.toString();
    });
  };

  const snapToNearestScene = () => {
    if (!scrollContainerRef.current) return;
    const target = Math.round(targetScrollProgress.current);
    if (Math.abs(targetScrollProgress.current - target) > 0.1) {
      scrollContainerRef.current.scrollTo({
        top: target * window.innerHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    let animationFrameId: number;
    let isSubscribed = true;

    const loop = () => {
      if (!isSubscribed) return;

      if (scenes.length > 0) {
        const smoothingFactor = (scenes[currentSceneIndex.current] as any)?.smoothingFactor ?? 0.015;
        currentScrollProgress.current += (targetScrollProgress.current - currentScrollProgress.current) * smoothingFactor;

        if (Math.abs(targetScrollProgress.current - currentScrollProgress.current) > 0.001) {
          updateSceneProgress(currentScrollProgress.current);
          isScrolling.current = true;
        } else if (isScrolling.current) {
          isScrolling.current = false;
          snapToNearestScene();
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    updateSceneProgress(0);
    animationFrameId = requestAnimationFrame(loop);

    return () => {
      isSubscribed = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, [scenes]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const snapHeight = window.innerHeight;
    let maxProgress = scenes.length;
    
    targetScrollProgress.current = Math.min(
      Math.max(0, scrollContainerRef.current.scrollTop / snapHeight),
      maxProgress
    );
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return null; // A headless hook
};
