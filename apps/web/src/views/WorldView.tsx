import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import GameGraph from '../components/GameGraph';
import PartyPanel from '../components/PartyPanel';
import Logo from '../components/Logo';
import ChatHeaderButton from '../components/ChatHeaderButton';
import MapPlayerAvatar from '../components/MapPlayerAvatar';
import { useOtherPlayerMarkers } from '../hooks/useOtherPlayerMarkers';
import { buildWorldGraph, type GNode } from '../lib/graphLayout';
import { PLAYER_MOVE_MS } from '../lib/useAnimatedPosition';
import type { CampaignBundle } from '../types/campaign';
import type { Navigator } from '../lib/router';
import { useProgress } from '../store/progress';
import { useUI } from '../store/ui';
import { useMultiplayer } from '../store/multiplayer';

interface Props {
  bundle: CampaignBundle;
  nav: Navigator;
}

function WorldNodeShape({ node }: { node: GNode }) {
  const { color, doneTopics, totalTopics } = node.meta as {
    color: string; doneTopics: number; totalTopics: number;
  };
  const locked   = node.state === 'locked';
  const complete = node.state === 'complete';
  const pct      = totalTopics > 0 ? Math.round((doneTopics / totalTopics) * 100) : 0;

  return (
    <g>
      <circle
        r={2.8}
        fill={locked ? 'rgba(10,8,5,0.5)' : 'rgba(20,16,10,0.75)'}
        stroke={locked ? 'rgba(120,95,60,0.35)' : 'rgba(200,180,145,0.75)'}
        strokeWidth={0.8}
        opacity={locked ? 0.45 : 1}
      />
      {complete ? (
        <text y="1.1" textAnchor="middle" fontSize="2.6" fill="rgba(200,180,145,0.9)"
          style={{ userSelect: 'none', pointerEvents: 'none' }}>✓</text>
      ) : (
        <circle r={0.7} fill={locked ? 'rgba(120,95,60,0.3)' : 'rgba(200,180,145,0.85)'} />
      )}
      <text y={6.2} textAnchor="middle" fontSize={2.1}
        fill={locked ? 'rgba(160,130,90,0.7)' : 'rgba(232,213,176,0.92)'}
        fontFamily="'Cinzel', 'Palatino Linotype', serif"
        fontWeight="600" letterSpacing="0.03"
        style={{ userSelect: 'none', pointerEvents: 'none' }}>
        {node.label}
      </text>
      {locked && (
        <text y={8.8} textAnchor="middle" fontSize={1.7} fill="rgba(120,95,60,0.55)"
          style={{ userSelect: 'none', pointerEvents: 'none' }}>locked</text>
      )}
      {!locked && (
        <text y={8.8} textAnchor="middle" fontSize={1.75}
          fill={complete ? 'rgba(200,180,145,0.8)' : 'rgba(140,110,75,0.85)'}
          style={{ userSelect: 'none', pointerEvents: 'none' }}>
          {doneTopics}/{totalTopics} · {pct}%
        </text>
      )}
    </g>
  );
}

export default function WorldView({ bundle, nav }: Props) {
  const { completedTopics, acceptedTopics, xp, lastVisitedRegionId, visitRegion } = useProgress();
  const { questLogOpen, toggleQuestLog, togglePartyPanel, partyPanelOpen } = useUI();
  const { currentPlayerId, players } = useMultiplayer();

  const { nodes, edges, initialVb, playerPos } = useMemo(
    () => buildWorldGraph(bundle, completedTopics, acceptedTopics, lastVisitedRegionId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bundle, completedTopics.join(','), acceptedTopics.join(','), lastVisitedRegionId],
  );

  const [showGrid, setShowGrid] = useState(false);
  const [playerOverride, setPlayerOverride] = useState<{ x: number; y: number } | null>(null);
  const [traveling, setTraveling] = useState(false);
  const travelTimerRef = useRef<number | null>(null);

  const displayPlayerPos = playerOverride ?? playerPos;

  useEffect(() => {
    setPlayerOverride(null);
  }, [lastVisitedRegionId, playerPos.x, playerPos.y]);

  useEffect(() => () => {
    if (travelTimerRef.current !== null) window.clearTimeout(travelTimerRef.current);
  }, []);

  const handleRegionClick = useCallback((regionId: string) => {
    if (traveling) return;

    const node = nodes.find((n) => n.id === regionId);
    if (!node) return;

    setPlayerOverride({ x: node.x, y: node.y });
    visitRegion(regionId);
    setTraveling(true);

    if (travelTimerRef.current !== null) window.clearTimeout(travelTimerRef.current);
    travelTimerRef.current = window.setTimeout(() => {
      travelTimerRef.current = null;
      setTraveling(false);
      nav.toRegion(regionId);
    }, PLAYER_MOVE_MS);
  }, [nodes, nav, traveling, visitRegion]);

  const activeQuestCount = acceptedTopics.filter(
    (id) => !completedTopics.includes(id),
  ).length;

  const currentMeta = currentPlayerId ? players[currentPlayerId] : null;
  const playerColor = currentMeta?.color;

  const otherMarkers = useOtherPlayerMarkers(bundle);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <GameGraph
        nodes={nodes}
        edges={edges}
        playerX={displayPlayerPos.x}
        playerY={displayPlayerPos.y}
        playerColor={playerColor}
        playerAvatar={currentMeta?.avatar}
        playerName={currentMeta?.name}
        bgImage="/content/assets/world.png"
        initialVb={initialVb}
        onNodeClick={handleRegionClick}
        renderNode={(node) => <WorldNodeShape node={node} />}
        extraSvgContent={
          <>
            {otherMarkers.map((m) => (
              <g key={m.id} transform={`translate(${m.x},${m.y})`}>
                <MapPlayerAvatar
                  avatar={m.avatar}
                  color={m.color}
                  size={2.1}
                  clipId={`other-player-${m.id}`}
                  label={m.name}
                />
              </g>
            ))}
          </>
        }
        showGrid={showGrid}
        header={
          <div className="map-header">
            <Logo
              size="header"
              onClick={togglePartyPanel}
              title={partyPanelOpen ? 'Hide party' : 'Show party'}
            />
            <span className="map-title">{bundle.campaign.title}</span>
            <button
              className={`map-quest-btn${questLogOpen ? ' active' : ''}`}
              onClick={toggleQuestLog}
            >
              Quests
              {activeQuestCount > 0 && (
                <span className="map-quest-count">{activeQuestCount}</span>
              )}
            </button>
            <ChatHeaderButton />
            <button
              className={`map-quest-btn${showGrid ? ' active' : ''}`}
              onClick={() => setShowGrid((v) => !v)}
              title="Toggle coordinate grid"
            >
              Grid
            </button>
            <span className="map-xp"><span>XP</span>{xp.toLocaleString()}</span>
          </div>
        }
      />

      {/* Combined party panel */}
      <PartyPanel bundle={bundle} />
    </div>
  );
}
