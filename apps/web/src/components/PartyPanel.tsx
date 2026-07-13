import type { CampaignBundle } from '../types/campaign';
import { useMultiplayer } from '../store/multiplayer';
import { useProgress } from '../store/progress';
import { useUI } from '../store/ui';

interface Props {
  bundle: CampaignBundle;
}

export default function PartyPanel({ bundle }: Props) {
  const { players, progress, currentPlayerId } = useMultiplayer();
  const { completedTopics, acceptedTopics, xp } = useProgress();
  const { partyPanelOpen } = useUI();

  const totalTopics = bundle.regions.reduce((s, r) => s + r.topics.length, 0);
  const activeQuestCount = acceptedTopics.filter((id) => !completedTopics.includes(id)).length;

  // Current player first, then others sorted by XP
  const sorted = Object.values(players).sort((a, b) => {
    if (a.id === currentPlayerId) return -1;
    if (b.id === currentPlayerId) return  1;
    return (progress[b.id]?.xp ?? 0) - (progress[a.id]?.xp ?? 0);
  });

  if (sorted.length === 0) return null;

  return (
    <div className={`party-panel${partyPanelOpen ? '' : ' collapsed'}`}>
      {sorted.map((player) => {
        const isSelf = player.id === currentPlayerId;
        const p      = isSelf
          ? { completedTopics, xp, acceptedTopics }
          : (progress[player.id] ?? { completedTopics: [], xp: 0, acceptedTopics: [] });
        const done   = p.completedTopics.length;
        const pxp    = p.xp;
        const progressPct = totalTopics > 0 ? (done / totalTopics) * 100 : 0;
        const quests = isSelf
          ? activeQuestCount
          : (progress[player.id]?.acceptedTopics ?? []).filter(
              (id) => !(progress[player.id]?.completedTopics ?? []).includes(id),
            ).length;

        return (
          <div
            key={player.id}
            className={`party-section${isSelf ? ' active' : ''}`}
            style={isSelf ? { borderTop: `3px solid ${player.color}` } : undefined}
          >
            <div className="party-portrait">
              <img src={player.avatar} alt={player.name} />
            </div>
            <div className="party-info">
              <div className="party-name" style={{ color: player.color }}>
                {player.name}{isSelf && ' ★'}
              </div>
              <div className="party-progress" aria-hidden="true">
                <div
                  className="party-progress-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="party-stats">
                <div className="party-stat">
                  <span className="party-stat-icon">✦</span>
                  <span className="party-stat-value">{pxp.toLocaleString()}</span>
                  <span className="party-stat-label">XP</span>
                </div>
                <div className="party-stat">
                  <span className="party-stat-icon">◈</span>
                  <span className="party-stat-value">{done}</span>
                  <span className="party-stat-label">/ {totalTopics} topics</span>
                </div>
                <div className="party-stat">
                  <span className="party-stat-icon">📜</span>
                  <span className="party-stat-value">{quests}</span>
                  <span className="party-stat-label">active quests</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
