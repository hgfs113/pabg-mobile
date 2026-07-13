import yaml from 'js-yaml';
import type { CampaignBundle, CampaignData, Region } from '../types/campaign';
import { assignTopicWaypoints } from './topicSlots';

// Maps region ID (from campaign.yaml) to its YAML filename in regions/.
// Explicit and trivially auditable.
const REGION_FILENAMES: Record<string, string> = {
  la: 'linear-algebra',
  opt: 'optimization',
  ml: 'machine-learning',
  cv: 'computer-vision',
  nlp: 'nlp-llm',
};

async function fetchYaml<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed to load ${path} — HTTP ${res.status}`);
  }
  const text = await res.text();
  return yaml.load(text) as T;
}

export async function loadCampaign(): Promise<CampaignBundle> {
  const campaign = await fetchYaml<CampaignData>('/content/campaign.yaml');

  const regions = await Promise.all(
    campaign.regions.map((id) => {
      const filename = REGION_FILENAMES[id];
      if (!filename) throw new Error(`Unknown region ID in campaign.yaml: "${id}"`);
      return fetchYaml<Region>(`/content/regions/${filename}.yaml`);
    }),
  );

  // Assign world-map waypoint x/y from campaign slot pool (ignores YAML coords).
  assignTopicWaypoints(campaign, regions);

  // Pre-build lookup maps once so components don't scan arrays repeatedly.
  const regionById: Record<string, Region> = {};
  const topicById: Record<string, import('../types/campaign').Topic> = {};
  const regionByTopicId: Record<string, Region> = {};

  for (const region of regions) {
    regionById[region.id] = region;
    for (const topic of region.topics) {
      topicById[topic.id] = topic;
      regionByTopicId[topic.id] = region;
    }
  }

  return { campaign, regions, regionById, topicById, regionByTopicId };
}
