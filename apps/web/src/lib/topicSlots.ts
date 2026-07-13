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

/** Region-map layout — independent of world waypoints. */
export function layoutRegionTopics(topics: Topic[]): Map<string, { x: number; y: number }> {
  if (topics.length === 0) return new Map();
  if (topics.length === 1) {
    return new Map([[topics[0].id, { x: 50, y: 50 }]]);
  }

  const margin = 16;
  const width = 100 - 2 * margin;

  return new Map(
    topics.map((t, i) => [
      t.id,
      {
        x: margin + (i / (topics.length - 1)) * width,
        y: 38 + (i % 2) * 24,
      },
    ]),
  );
}
