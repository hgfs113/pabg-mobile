import { useMemo } from 'react';
import { worldMapCoords, buildRegionGraph } from '../lib/graphLayout';
import { useMultiplayer } from '../store/multiplayer';
import type { CampaignBundle, Region } from '../types/campaign';

export interface OtherPlayerMarker {
  id: string;
  name: string;
  color: string;
  avatar: string;
  x: number;
  y: number;
}

export function useOtherPlayerMarkers(bundle: CampaignBundle): OtherPlayerMarker[] {
  const { players, progress, currentPlayerId } = useMultiplayer();

  return useMemo(() => {
    const regionPos = (regionId: string | null) => {
      if (!regionId) return null;
      const node = bundle.campaign.world.nodes.find((n) => n.region === regionId);
      return node ? worldMapCoords(node.x, node.y) : null;
    };

    return Object.values(players)
      .filter((p) => p.id !== currentPlayerId)
      .map((p) => {
        const prog = progress[p.id];
        if (!prog) return null;

        const pos =
          regionPos(prog.lastVisitedRegionId) ??
          (() => {
            const lastId = prog.lastCompletedTopicId;
            const r = lastId ? bundle.regionByTopicId[lastId] : null;
            return r ? regionPos(r.id) : null;
          })() ??
          (() => {
            const first = bundle.campaign.world.nodes[0];
            return first ? worldMapCoords(first.x, first.y) : worldMapCoords(18, 78);
          })();

        return { id: p.id, name: p.name, color: p.color, avatar: p.avatar, x: pos.x, y: pos.y };
      })
      .filter(Boolean) as OtherPlayerMarker[];
  }, [players, progress, currentPlayerId, bundle]);
}

export function useRegionOtherPlayerMarkers(
  bundle: CampaignBundle,
  region: Region,
): OtherPlayerMarker[] {
  const { players, progress, currentPlayerId } = useMultiplayer();

  return useMemo(() => {
    return Object.values(players)
      .filter((p) => p.id !== currentPlayerId)
      .filter((p) => progress[p.id]?.lastVisitedRegionId === region.id)
      .map((p) => {
        const prog = progress[p.id];
        const { playerPos } = buildRegionGraph(
          region,
          bundle,
          prog.completedTopics,
          prog.acceptedTopics,
          prog.lastCompletedTopicId,
        );
        return {
          id: p.id,
          name: p.name,
          color: p.color,
          avatar: p.avatar,
          x: playerPos.x,
          y: playerPos.y,
        };
      });
  }, [players, progress, currentPlayerId, bundle, region]);
}
