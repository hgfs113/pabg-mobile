import { useMemo, useState, useEffect } from 'react';
import GameGraph from '../components/GameGraph';
import QuestPanel from '../components/QuestPanel';
import MapPlayerAvatar from '../components/MapPlayerAvatar';
import Logo from '../components/Logo';
import ChatHeaderButton from '../components/ChatHeaderButton';
import { useRegionOtherPlayerMarkers } from '../hooks/useOtherPlayerMarkers';
import { buildRegionGraph, regionMapBackground, type GNode } from '../lib/graphLayout';
import type { CampaignBundle, Region, Topic } from '../types/campaign';
import type { Navigator } from '../lib/router';
import { useProgress } from '../store/progress';
import { useUI } from '../store/ui';
import { useMultiplayer } from '../store/multiplayer';

interface Props {
  bundle: CampaignBundle;
  region: Region;
  nav: Navigator;
  /** If set, auto-open quest panel for this topic on mount (from Quest Log click) */
  autoOpenTopicId?: string | null;
}

function TopicNodeShape({ node }: { node: GNode }) {
  const { color } = node.meta as { color: string; topic: Topic };
  const locked   = node.state === 'locked';
  const complete = node.state === 'complete';
  const active   = node.state === 'active';

  return (
    <g filter={locked ? undefined : 'url(#gg-glow)'}>
      {active && (
        <circle r={3.5} fill={color} opacity={0.12}>
          <animate attributeName="r"       values="3.5;4.5;3.5"          dur="2.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.12;0.04;0.12"       dur="2.2s" repeatCount="indefinite" />
        </circle>
      )}

      <rect
        x={-2.5} y={-2.5} width={5} height={5}
        transform="rotate(45)"
        fill={color}
        fillOpacity={locked ? 0.06 : complete ? 0.45 : active ? 0.28 : 0.12}
        stroke={color}
        strokeOpacity={locked ? 0.25 : 1}
        strokeWidth={locked ? 0.3 : active ? 0.9 : 0.55}
      />

      {complete ? (
        <text
          y="1"
          textAnchor="middle"
          fontSize="3"
          fill={color}
          fontWeight="700"
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          ✓
        </text>
      ) : (
        <circle r="0.7" fill={color} opacity={locked ? 0.2 : 0.9} />
      )}

      <text
        y="5.5"
        textAnchor="middle"
        fontSize="1.75"
        fill={locked ? 'rgba(160,130,90,0.65)' : '#e8d5b0'}
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {node.label}
      </text>
    </g>
  );
}

export default function RegionView({ bundle, region, nav, autoOpenTopicId }: Props) {
  const { completedTopics, acceptedTopics, acceptTopic, xp, visitRegion, lastCompletedTopicId } = useProgress();
  const { questLogOpen, toggleQuestLog, togglePartyPanel, partyPanelOpen } = useUI();
  const { players, currentPlayerId } = useMultiplayer();

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(
    autoOpenTopicId ?? null,
  );
  const [playerOverride, setPlayerOverride] = useState<{ x: number; y: number } | null>(null);
  const [showGrid, setShowGrid] = useState(false);

  useEffect(() => {
    visitRegion(region.id);
  }, [region.id, visitRegion]);

  const { nodes, edges, initialVb, playerPos } = useMemo(
    () => buildRegionGraph(region, bundle, completedTopics, acceptedTopics, lastCompletedTopicId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [region.id, completedTopics.join(','), acceptedTopics.join(','), lastCompletedTopicId],
  );

  const displayPlayerPos = playerOverride ?? playerPos;
  const currentMeta = currentPlayerId ? players[currentPlayerId] : null;

  // Reset manual override only when switching regions
  useEffect(() => {
    setPlayerOverride(null);
  }, [region.id]);

  const movePlayerToTopic = (topicId: string) => {
    const node = nodes.find((n) => n.id === topicId);
    if (node) setPlayerOverride({ x: node.x, y: node.y });
  };

  // Auto-open from quest log navigation
  useEffect(() => {
    if (!autoOpenTopicId) return;
    setSelectedTopicId(autoOpenTopicId);
    movePlayerToTopic(autoOpenTopicId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenTopicId, nodes]);

  const selectedTopic = selectedTopicId
    ? region.topics.find((t) => t.id === selectedTopicId) ?? null
    : null;

  const handleTopicClick = (topicId: string) => {
    const topic = region.topics.find((t) => t.id === topicId);
    if (!topic) return;
    movePlayerToTopic(topicId);
    acceptTopic(topicId);
    setSelectedTopicId(topicId);
  };

  const activeQuestCount = acceptedTopics.filter(
    (id) => !completedTopics.includes(id),
  ).length;

  const otherMarkers = useRegionOtherPlayerMarkers(bundle, region);

  return (
    <div className="region-view-root">
      <div className="region-view-main">
      <GameGraph
        fillParent
        nodes={nodes}
        edges={edges}
        playerX={displayPlayerPos.x}
        playerY={displayPlayerPos.y}
        playerColor={currentMeta?.color}
        playerAvatar={currentMeta?.avatar}
        playerName={currentMeta?.name}
        playerSize={4}
        bgImage={regionMapBackground(region)}
        bgTint={region.color}
        initialVb={initialVb}
        onNodeClick={handleTopicClick}
        renderNode={(node) => <TopicNodeShape node={node} />}
        extraSvgContent={
          <>
            {otherMarkers.map((m) => (
              <g key={m.id} transform={`translate(${m.x},${m.y})`}>
                <MapPlayerAvatar
                  avatar={m.avatar}
                  color={m.color}
                  size={3.2}
                  clipId={`region-other-${m.id}`}
                  label={m.name}
                />
              </g>
            ))}
          </>
        }
        showGrid={showGrid}
        edgePathStyle="region"
        header={
          <div className="map-header">
            <Logo
              size="header"
              onClick={togglePartyPanel}
              title={partyPanelOpen ? 'Hide party' : 'Show party'}
            />
            <button className="map-back" onClick={nav.toWorld}>← World</button>
            <span className="map-title" style={{ color: region.color }}>
              {region.world_name}
            </span>
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
      </div>

      {selectedTopic && (
        <QuestPanel
          topic={selectedTopic}
          regionName={region.world_name}
          regionColor={region.color}
          onClose={() => setSelectedTopicId(null)}
        />
      )}
    </div>
  );
}
