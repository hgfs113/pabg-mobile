/**
 * PlayerRoster — fixed panel on the right side of the world map.
 * Shows all registered players sorted by XP with their avatar, color and stats.
 */
import type { CampaignBundle } from '../types/campaign';
import { useMultiplayer } from '../store/multiplayer';

interface Props {
  bundle: CampaignBundle;
}

export default function PlayerRoster({ bundle }: Props) {
  const { players, progress, currentPlayerId } = useMultiplayer();

  const totalTopics = bundle.regions.reduce((s, r) => s + r.topics.length, 0);

  const sorted = Object.values(players).sort((a, b) => {
    const pa = progress[a.id];
    const pb = progress[b.id];
    return (pb?.xp ?? 0) - (pa?.xp ?? 0);
  });

  if (sorted.length === 0) return null;

  return (
    <div className="player-roster">
      <div className="player-roster-title">Adventurers</div>
      {sorted.map((player) => {
        const p      = progress[player.id];
        const done   = p?.completedTopics.length ?? 0;
        const xp     = p?.xp ?? 0;
        const isSelf = player.id === currentPlayerId;

        return (
          <div key={player.id} className={`roster-item${isSelf ? ' self' : ''}`}>
            {/* Mini avatar */}
            <div className="roster-avatar" style={{ borderColor: player.color }}>
              <img src={player.avatar} alt={player.name} />
            </div>

            <div className="roster-body">
              <div className="roster-name" style={{ color: isSelf ? player.color : undefined }}>
                {player.name}{isSelf && ' ★'}
              </div>
              <div className="roster-stats">
                <span className="roster-xp">{xp.toLocaleString()} XP</span>
                <span className="roster-topics">{done}/{totalTopics}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
