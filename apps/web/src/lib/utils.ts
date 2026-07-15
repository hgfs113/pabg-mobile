import type { CampaignBundle, Region, Topic } from '../types/campaign';

// Whether a region is accessible (all prerequisite regions fully completed).
export function isRegionUnlocked(
  region: Region,
  completedTopics: string[],
  bundle: CampaignBundle,
): boolean {
  if (region.unlocks_after.length === 0) return true;
  return region.unlocks_after.every((prereqId) => {
    const prereq = bundle.regionById[prereqId];
    if (!prereq) return false;
    return prereq.topics.every((t) => completedTopics.includes(t.id));
  });
}

// Whether a topic's prerequisite topics are all completed.
export function isTopicUnlocked(topic: Topic, completedTopics: string[]): boolean {
  return topic.requires.every((req) => completedTopics.includes(req));
}

/** Short numeric label for region-map nodes (full title lives in quest panel). */
export function topicMapLabel(topic: Topic): string {
  const fromId = topic.id.match(/_i0*(\d+)$/i)?.[1];
  if (fromId) return String(Number(fromId));

  const fromLabel = topic.waypoint.label.match(/(\d+)/)?.[1];
  if (fromLabel) return String(Number(fromLabel));

  return topic.waypoint.label.length > 6
    ? topic.waypoint.label.slice(0, 5) + '…'
    : topic.waypoint.label;
}

// Player position: waypoint of the last completed topic, or the first world node.
export function playerPosition(
  bundle: CampaignBundle,
  lastCompletedTopicId: string | null,
): { x: number; y: number } {
  if (lastCompletedTopicId) {
    const topic = bundle.topicById[lastCompletedTopicId];
    if (topic) return { x: topic.waypoint.x, y: topic.waypoint.y };
  }
  const firstNode = bundle.campaign.world.nodes[0];
  return firstNode ? { x: firstNode.x, y: firstNode.y } : { x: 22, y: 78 };
}

// Which region contains the last completed topic.
export function activeRegionId(
  bundle: CampaignBundle,
  lastCompletedTopicId: string | null,
): string | null {
  if (!lastCompletedTopicId) return bundle.regions[0]?.id ?? null;
  return bundle.regionByTopicId[lastCompletedTopicId]?.id ?? null;
}
