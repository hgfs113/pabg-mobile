/**
 * Builds GNode/GEdge arrays for GameGraph.
 * Topic state is now: locked | unlocked | active (accepted, not done) | complete.
 * There is no topic-level graph — encounters are surfaced in QuestPanel.
 */
import type { CampaignBundle, Region } from '../types/campaign';
import { isRegionUnlocked, isTopicUnlocked } from './utils';
import { layoutRegionTopics } from './topicSlots';

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface GNode {
  id: string;
  x: number; // 0–100, normalised
  y: number;
  state: 'locked' | 'unlocked' | 'active' | 'complete';
  label: string;
  sublabel?: string;
  meta: unknown;
}

export interface GEdge {
  from: string;
  to: string;
  traversed: boolean;
}

export interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GraphData {
  nodes: GNode[];
  edges: GEdge[];
  initialVb: ViewBox;
  playerPos: { x: number; y: number };
}

/** World map image is 1536×1024 (3:2). ViewBox matches full image — no square crop. */
export const WORLD_MAP_VB: ViewBox = { x: 0, y: 0, w: 150, h: 100 };

/** Region maps with a custom background use the same 3:2 viewBox as the artwork. */
export const REGION_WIDE_MAP_VB: ViewBox = { x: 0, y: 0, w: 150, h: 100 };
export const REGION_SQUARE_MAP_VB: ViewBox = { x: 0, y: 0, w: 100, h: 100 };

const DEFAULT_REGION_BG = '/content/assets/level.png';

export function regionMapBackground(region: Region): string {
  return region.map_background
    ? `/content/assets/${region.map_background}`
    : DEFAULT_REGION_BG;
}

export function regionMapViewBox(region: Region): ViewBox {
  return region.map_background ? REGION_WIDE_MAP_VB : REGION_SQUARE_MAP_VB;
}

/** Stretch auto-layout coords (0–100 square) onto a wide region viewBox. */
function wideRegionMapCoords(x: number, y: number, vb: ViewBox): { x: number; y: number } {
  return { x: (x / 100) * vb.w, y: (y / 100) * vb.h };
}

/**
 * Legacy node coords were authored on a center-square crop of the landscape map.
 * Map them onto the full 3:2 viewBox so markers stay aligned with the artwork.
 */
export function worldMapCoords(x: number, y: number): { x: number; y: number } {
  const cropX = 256 / 1536;
  const cropW = 1024 / 1536;
  return {
    x: (cropX + (x / 100) * cropW) * WORLD_MAP_VB.w,
    y: (y / 100) * WORLD_MAP_VB.h,
  };
}

// ─── World-level graph ────────────────────────────────────────────────────────

export function buildWorldGraph(
  bundle: CampaignBundle,
  completedTopics: string[],
  acceptedTopics: string[],
  lastVisitedRegionId: string | null,
): GraphData {
  const nodes: GNode[] = bundle.campaign.world.nodes.map((n) => {
    const region = bundle.regionById[n.region];
    const unlocked = region ? isRegionUnlocked(region, completedTopics, bundle) : false;
    const totalTopics = region?.topics.length ?? 0;
    const doneTopics  = region?.topics.filter((t) => completedTopics.includes(t.id)).length ?? 0;
    const allComplete = totalTopics > 0 && doneTopics === totalTopics;

    return {
      id: n.region,
      ...worldMapCoords(n.x, n.y),
      state: !unlocked ? 'locked' : allComplete ? 'complete' : 'unlocked',
      label: n.world_name,
      meta: { color: n.color, doneTopics, totalTopics },
    };
  });

  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  const edges: GEdge[] = bundle.campaign.world.edges.map((e) => ({
    from: e.from,
    to: e.to,
    // Road is bright only when the source region is fully completed
    traversed: nodeMap[e.from]?.state === 'complete',
  }));

  return {
    nodes,
    edges,
    initialVb: { ...WORLD_MAP_VB },
    playerPos: worldPlayerPos(bundle, completedTopics, acceptedTopics, lastVisitedRegionId),
  };
}

function regionNodePos(bundle: CampaignBundle, regionId: string) {
  const node = bundle.campaign.world.nodes.find((n) => n.region === regionId);
  return node ? worldMapCoords(node.x, node.y) : null;
}

function worldPlayerPos(
  bundle: CampaignBundle,
  completedTopics: string[],
  acceptedTopics: string[],
  lastVisitedRegionId: string | null,
) {
  if (lastVisitedRegionId) {
    const pos = regionNodePos(bundle, lastVisitedRegionId);
    if (pos) return pos;
  }

  for (let i = acceptedTopics.length - 1; i >= 0; i--) {
    if (completedTopics.includes(acceptedTopics[i])) continue;
    const region = bundle.regionByTopicId[acceptedTopics[i]];
    if (region) {
      const pos = regionNodePos(bundle, region.id);
      if (pos) return pos;
    }
  }

  for (let i = completedTopics.length - 1; i >= 0; i--) {
    const region = bundle.regionByTopicId[completedTopics[i]];
    if (region) {
      const pos = regionNodePos(bundle, region.id);
      if (pos) return pos;
    }
  }

  const first = bundle.campaign.world.nodes[0];
  return first ? worldMapCoords(first.x, first.y) : { x: 25, y: 52 };
}

// ─── Region-level graph ───────────────────────────────────────────────────────

export function buildRegionGraph(
  region: Region,
  bundle: CampaignBundle,
  completedTopics: string[],
  acceptedTopics: string[],
  lastCompletedTopicId: string | null = null,
): GraphData {
  // Region map layout is independent of world-map waypoints.
  const posMap = layoutRegionTopics(region.topics);
  const initialVb = regionMapViewBox(region);
  const mapPos = (x: number, y: number) =>
    region.map_background ? wideRegionMapCoords(x, y, initialVb) : { x, y };

  const nodes: GNode[] = region.topics.map((t) => {
    const unlocked = isTopicUnlocked(t, completedTopics);
    const complete  = completedTopics.includes(t.id);
    const accepted  = acceptedTopics.includes(t.id);
    const state: GNode['state'] = !unlocked
      ? 'locked'
      : complete
      ? 'complete'
      : accepted
      ? 'active'
      : 'unlocked';

    const pos = mapPos(posMap.get(t.id)!.x, posMap.get(t.id)!.y);

    return {
      id: t.id,
      x: pos.x,
      y: pos.y,
      state,
      label: t.title,
      sublabel: `${t.estimated_hours}h`,
      meta: { topic: t, color: region.color },
    };
  });

  // Intra-region edges only
  const edges: GEdge[] = region.topics.flatMap((t) =>
    t.requires
      .filter((reqId) => region.topics.some((ot) => ot.id === reqId))
      .map((reqId) => ({
        from: reqId,
        to: t.id,
        traversed: completedTopics.includes(reqId),
      })),
  );

  // Player stands on the last completed topic in this region.
  const regionIds = new Set(region.topics.map((t) => t.id));
  const defaultPos = posMap.get(region.topics[0].id) ?? { x: 50, y: 80 };
  let playerPos = mapPos(defaultPos.x, defaultPos.y);

  if (lastCompletedTopicId && regionIds.has(lastCompletedTopicId)) {
    const pos = posMap.get(lastCompletedTopicId) ?? defaultPos;
    playerPos = mapPos(pos.x, pos.y);
  } else {
    for (let i = region.topics.length - 1; i >= 0; i--) {
      const topicId = region.topics[i].id;
      if (completedTopics.includes(topicId)) {
        const pos = posMap.get(topicId) ?? defaultPos;
        playerPos = mapPos(pos.x, pos.y);
        break;
      }
    }
  }

  return { nodes, edges, initialVb, playerPos };
}
