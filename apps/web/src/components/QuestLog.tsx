/**
 * QuestLog — centred modal covering 80% of the screen.
 * Left column: active quests. Right column: completed quests.
 */
import type { CampaignBundle } from '../types/campaign';
import { useProgress } from '../store/progress';
import { useUI } from '../store/ui';

interface Props {
  bundle: CampaignBundle;
  onFocusQuest: (topicId: string, regionId: string) => void;
}

export default function QuestLog({ bundle, onFocusQuest }: Props) {
  const { acceptedTopics, completedTopics } = useProgress();
  const { closeQuestLog } = useUI();

  const quests = acceptedTopics
    .map((id) => {
      const topic  = bundle.topicById[id];
      const region = bundle.regionByTopicId[id];
      if (!topic || !region) return null;
      return { topic, region, done: completedTopics.includes(id) };
    })
    .filter(Boolean) as Array<{
      topic: (typeof bundle.topicById)[string];
      region: (typeof bundle.regionById)[string];
      done: boolean;
    }>;

  const active    = quests.filter((q) => !q.done);
  const completed = quests.filter((q) => q.done);

  const handleClick = (topicId: string, regionId: string) => {
    closeQuestLog();
    onFocusQuest(topicId, regionId);
  };

  return (
    <div className="quest-log-overlay">
      <div className="quest-log-backdrop" onClick={closeQuestLog} />
      <div className="quest-log-panel">

        <div className="quest-log-header">
          <span className="quest-log-title">Quest Log</span>
          <button className="quest-log-close" onClick={closeQuestLog} aria-label="Close">×</button>
        </div>

        <div className="quest-log-body">

          {/* ── Active quests ── */}
          <div className="quest-log-col">
            <div className="quest-log-col-header">
              Active — {active.length}
            </div>
            <div className="quest-log-col-scroll">
              {active.length === 0 && (
                <div className="quest-log-empty">
                  No active quests.<br />
                  Open a topic on the region map to begin.
                </div>
              )}
              {active.map(({ topic, region }) => (
                <div
                  key={topic.id}
                  className="quest-log-item"
                  onClick={() => handleClick(topic.id, region.id)}
                >
                  <div
                    className="quest-log-item-dot"
                    style={{ backgroundColor: region.color }}
                  />
                  <div className="quest-log-item-body">
                    <div className="quest-log-item-title">{topic.title}</div>
                    <div className="quest-log-item-region" style={{ color: region.color }}>
                      {region.world_name}
                    </div>
                    {topic.description && (
                      <div className="quest-log-item-desc">{topic.description}</div>
                    )}
                  </div>
                  <div className="quest-log-item-xp">+{topic.reward.xp} XP</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Completed quests ── */}
          <div className="quest-log-col">
            <div className="quest-log-col-header">
              Completed — {completed.length}
            </div>
            <div className="quest-log-col-scroll">
              {completed.length === 0 && (
                <div className="quest-log-empty">
                  No completed quests yet.
                </div>
              )}
              {completed.map(({ topic, region }) => (
                <div
                  key={topic.id}
                  className="quest-log-item"
                  onClick={() => handleClick(topic.id, region.id)}
                >
                  <div
                    className="quest-log-item-dot"
                    style={{ backgroundColor: region.color, opacity: 0.4 }}
                  />
                  <div className="quest-log-item-body">
                    <div className="quest-log-item-title done">{topic.title}</div>
                    <div
                      className="quest-log-item-region"
                      style={{ color: region.color, opacity: 0.55 }}
                    >
                      {region.world_name}
                    </div>
                    {topic.description && (
                      <div className="quest-log-item-desc">{topic.description}</div>
                    )}
                  </div>
                  <div className="quest-log-item-xp" style={{ opacity: 0.45 }}>
                    +{topic.reward.xp} XP
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
