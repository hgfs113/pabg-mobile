import { useEffect, useRef, useState } from 'react';

export const PLAYER_MOVE_MS = 480;

/** Smoothly interpolates toward target (x, y) over durationMs. */
export function useAnimatedPosition(
  targetX: number,
  targetY: number,
  durationMs = PLAYER_MOVE_MS,
): { x: number; y: number } {
  const [pos, setPos] = useState({ x: targetX, y: targetY });
  const posRef = useRef(pos);
  posRef.current = pos;

  useEffect(() => {
    const fromX = posRef.current.x;
    const fromY = posRef.current.y;
    if (fromX === targetX && fromY === targetY) return;

    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const ease = 1 - Math.pow(1 - t, 3);
      const next = {
        x: fromX + (targetX - fromX) * ease,
        y: fromY + (targetY - fromY) * ease,
      };
      posRef.current = next;
      setPos(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [targetX, targetY, durationMs]);

  return pos;
}
