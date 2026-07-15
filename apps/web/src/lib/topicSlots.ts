/**
 * Assigns world-map waypoint coordinates to topics from the campaign slot pool.
 *
 * Slots live in campaign.yaml → world.topic_slots (separate from topic data).
 * Each topic gets a deterministic free slot based on its id hash.
 * x/y in topic YAML waypoints are ignored — only icon and label are kept.
 */
import type { CampaignData, Region, Topic } from '../types/campaign';

export interface TopicSlot {
  x: number;
  y: number;
}

/** Stable 32-bit hash — same topic id always picks the same starting slot. */
function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function topicJitter(id: string): { x: number; y: number } {
  const h = hashId(id);
  return {
    x: ((h % 17) - 8) * 0.28,
    y: (((h >> 4) % 13) - 6) * 0.28,
  };
}

/** Pick first unused slot starting from hash(topicId) % slots.length. */
function pickSlot(topicId: string, used: Set<number>, slots: TopicSlot[]): number {
  const start = hashId(topicId) % slots.length;
  for (let i = 0; i < slots.length; i++) {
    const idx = (start + i) % slots.length;
    if (!used.has(idx)) return idx;
  }
  // All slots taken — overlap (more topics than slots)
  return start;
}

/** Collect all topics in campaign region order, then YAML list order. */
function allTopicsInOrder(campaign: CampaignData, regions: Region[]): Topic[] {
  const byId = Object.fromEntries(regions.map((r) => [r.id, r]));
  return campaign.regions.flatMap((id) => byId[id]?.topics ?? []);
}

/**
 * Mutates topics in place: sets waypoint.x/y from slot pool.
 * Must run once during campaign load.
 */
export function assignTopicWaypoints(campaign: CampaignData, regions: Region[]): void {
  const slots = campaign.world.topic_slots;
  if (!slots?.length) return;

  const used = new Set<number>();
  for (const topic of allTopicsInOrder(campaign, regions)) {
    const idx = pickSlot(topic.id, used, slots);
    used.add(idx);
    topic.waypoint.x = slots[idx].x;
    topic.waypoint.y = slots[idx].y;
  }
}

/** Topological order within a region (respects requires edges). */
function topoSortTopics(topics: Topic[]): Topic[] {
  const ids = new Set(topics.map((t) => t.id));
  const order = new Map(topics.map((t, i) => [t.id, i]));
  const indegree = new Map<string, number>();
  const children = new Map<string, string[]>();

  for (const t of topics) {
    indegree.set(t.id, 0);
    children.set(t.id, []);
  }

  for (const t of topics) {
    const reqs = t.requires.filter((r) => ids.has(r));
    indegree.set(t.id, reqs.length);
    for (const r of reqs) {
      children.get(r)!.push(t.id);
    }
  }

  const queue = topics
    .filter((t) => (indegree.get(t.id) ?? 0) === 0)
    .map((t) => t.id)
    .sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));

  const sorted: Topic[] = [];
  const byId = Object.fromEntries(topics.map((t) => [t.id, t]));

  while (queue.length) {
    const id = queue.shift()!;
    sorted.push(byId[id]);
    for (const child of children.get(id) ?? []) {
      const next = (indegree.get(child) ?? 1) - 1;
      indegree.set(child, next);
      if (next === 0) {
        queue.push(child);
        queue.sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));
      }
    }
  }

  for (const t of topics) {
    if (!sorted.some((s) => s.id === t.id)) sorted.push(t);
  }
  return sorted;
}

/**
 * Winding path pool for region maps — varied heights, not two parallel lanes.
 * Inspired by the world-map slot curve but scaled for a single region viewBox.
 */
function regionSlotPool(count: number): TopicSlot[] {
  const n = Math.max(count, 8);
  const slots: TopicSlot[] = [];

  for (let i = 0; i < n; i++) {
    const t = i / Math.max(n - 1, 1);
    const serp = Math.sin(t * Math.PI * 2.8);
    const x = 50 + serp * 34 + Math.sin(t * Math.PI * 5.1) * 4;
    const y = 84 - t * 58 + Math.cos(t * Math.PI * 3.7) * 5;
    slots.push({
      x: Math.min(93, Math.max(7, x)),
      y: Math.min(90, Math.max(10, y)),
    });
  }

  return slots;
}

/** Region-map layout — winding trail through varied coordinates. */
export function layoutRegionTopics(topics: Topic[]): Map<string, { x: number; y: number }> {
  if (topics.length === 0) return new Map();
  if (topics.length === 1) {
    return new Map([[topics[0].id, { x: 50, y: 50 }]]);
  }

  const ordered = topoSortTopics(topics);
  const slots = regionSlotPool(ordered.length);

  return new Map(
    ordered.map((t, i) => {
      const slot = slots[Math.min(i, slots.length - 1)];
      const jitter = topicJitter(t.id);
      return [
        t.id,
        {
          x: Math.min(94, Math.max(6, slot.x + jitter.x)),
          y: Math.min(92, Math.max(8, slot.y + jitter.y)),
        },
      ];
    }),
  );
}
