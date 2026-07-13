export interface Point {
  x: number;
  y: number;
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  }
  return h >>> 0;
}

function rand01(seed: number, i: number): number {
  const x = Math.sin(seed * 12.9898 + i * 78.233) * 43_758.5453;
  return x - Math.floor(x);
}

/** Stable key for an undirected edge. */
export function edgePathSeed(from: string, to: string): string {
  return from < to ? `${from}|${to}` : `${to}|${from}`;
}

/**
 * Organic trail: several irregular waypoints + Catmull-Rom spline.
 * Each segment gets a different curvature — not one uniform Bézier arc.
 */
export function buildTrailPath(from: Point, to: Point, seed: string): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  const h = hashString(seed);

  const interiorCount =
    len < 16 ? 1 :
    len < 32 ? 2 :
    2 + (h % 2); // 1, 2, or 3 interior knots

  const ts: number[] = [];
  for (let i = 0; i < interiorCount; i++) {
    ts.push(0.14 + rand01(h, i * 5) * 0.72);
  }
  ts.sort((a, b) => a - b);

  for (let i = 1; i < ts.length; i++) {
    const minGap = 0.11 + rand01(h, 30 + i) * 0.07;
    if (ts[i] - ts[i - 1] < minGap) {
      ts[i] = Math.min(ts[i - 1] + minGap, 0.9);
    }
  }

  const points: Point[] = [from];

  for (let i = 0; i < interiorCount; i++) {
    const t = ts[i];
    const side = rand01(h, i * 5 + 1) > 0.5 ? 1 : -1;
    const ampScale = 0.45 + rand01(h, i * 5 + 2) * 1.1;
    const amp = Math.min(len * (0.11 + rand01(h, i * 5 + 3) * 0.24), 12) * ampScale;
    const along = (rand01(h, i * 5 + 4) - 0.5) * Math.min(len * 0.05, 2.2);

    points.push({
      x: from.x + dx * t + px * side * amp + (dx / len) * along,
      y: from.y + dy * t + py * side * amp + (dy / len) * along,
    });
  }

  points.push(to);

  const tension = 0.65 + rand01(h, 100) * 0.7;
  return catmullRomPath(points, tension);
}

/** Smooth spline through waypoints — curvature changes between each segment. */
function catmullRomPath(points: Point[], tension: number): string {
  const n = points.length;
  if (n < 2) return '';

  const ghost = (i: number): Point => {
    if (i < 0) {
      const a = points[0];
      const b = points[1];
      return { x: a.x + (a.x - b.x) * 0.68, y: a.y + (a.y - b.y) * 0.68 };
    }
    if (i >= n) {
      const a = points[n - 1];
      const b = points[n - 2];
      return { x: a.x + (a.x - b.x) * 0.68, y: a.y + (a.y - b.y) * 0.68 };
    }
    return points[i];
  };

  const s = tension / 6;
  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < n - 1; i++) {
    const p0 = ghost(i - 1);
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = ghost(i + 2);

    const cp1 = {
      x: p1.x + (p2.x - p0.x) * s,
      y: p1.y + (p2.y - p0.y) * s,
    };
    const cp2 = {
      x: p2.x - (p3.x - p1.x) * s,
      y: p2.y - (p3.y - p1.y) * s,
    };

    d += ` C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${p2.x} ${p2.y}`;
  }

  return d;
}
