// TypeScript types that mirror the Campaign DSL v1.
// Field names intentionally match YAML keys exactly (snake_case)
// so js-yaml output can be cast directly without transformation.

export interface Resource {
  type: 'book' | 'video' | 'paper' | 'url';
  title: string;
  ref?: string;
  url?: string;
}

export interface Encounter {
  id: string;
  type: 'theory' | 'practice' | 'review';
  title: string;
  description: string;
  xp: number;
  resources?: Resource[];
  tasks?: string[];
}

export interface Reward {
  xp: number;
  item?: string;
  title?: string;
}

export interface Waypoint {
  x: number;
  y: number;
  icon: string;
  label: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  estimated_hours: number;
  requires: string[];
  reward: Reward;
  waypoint: Waypoint;
  encounters: Encounter[];
}

export interface TopicSlot {
  x: number;
  y: number;
}

export interface Region {
  dsl_version: string;
  id: string;
  title: string;
  world_name: string;
  world_description: string;
  color: string;
  /** Filename in content/assets/. Wide 3:2 viewBox when set; otherwise square + level.png. */
  map_background?: string;
  unlocks_after: string[];
  topics: Topic[];
}

export interface WorldNode {
  region: string;
  world_name: string;
  description: string;
  x: number;
  y: number;
  color: string;
}

export interface WorldEdge {
  from: string;
  to: string;
}

export interface CampaignData {
  dsl_version: string;
  id: string;
  title: string;
  version: string;
  description: string;
  regions: string[];
  world: {
    name: string;
    description: string;
    nodes: WorldNode[];
    edges: WorldEdge[];
    /** World-map positions for topics. Assigned at load time (see topicSlots.ts). */
    topic_slots?: TopicSlot[];
  };
}

// Fully resolved campaign with lookup maps pre-built at load time.
export interface CampaignBundle {
  campaign: CampaignData;
  regions: Region[];
  regionById: Record<string, Region>;
  topicById: Record<string, Topic>;
  regionByTopicId: Record<string, Region>;
}
