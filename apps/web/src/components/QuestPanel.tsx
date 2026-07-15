/**
 * QuestPanel — compact bar at the bottom of the region view (no internal scroll).
 * Full details: use Quest Log. Map shrinks to make room for the panel.
 */
import type { Topic, Resource } from '../types/campaign';
import { useProgress } from '../store/progress';

interface Props {
  topic: Topic;
  regionName: string;
  regionColor: string;
  onClose: () => void;
}

const RESOURCE_ICONS: Record<string, string> = {
  book:  '📖',
  video: '▶',
  paper: '📄',
  url:   '🔗',
};

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function linkLabel(r: Resource): string {
  const t = r.title.trim();
  if (t.length <= 36) return t;
  return t.slice(0, 34) + '…';
}

export default function QuestPanel({ topic, regionName, regionColor, onClose }: Props) {
  const { completedTopics, completeTopic } = useProgress();
  const isDone = completedTopics.includes(topic.id);

  const links = topic.encounters
    .flatMap((e) => e.resources ?? [])
    .filter((r) => r.url && isExternalUrl(r.url));

  const taskCount = topic.encounters.reduce(
    (n, e) => n + (e.tasks?.length ?? 0),
    0,
  );

  const handleComplete = () => {
    completeTopic(topic.id, topic.reward.xp);
    onClose();
  };

  return (
    <div className="quest-panel">
      <div className="quest-panel-header">
        <span
          className="quest-region-badge"
          style={{
            backgroundColor: regionColor + '22',
            border: `1px solid ${regionColor}55`,
            color: regionColor,
          }}
        >
          {regionName}
        </span>
        <span className="quest-panel-title">{topic.title}</span>
        <span className="quest-panel-meta">{topic.estimated_hours}h</span>
        <button className="quest-close-btn" onClick={onClose} aria-label="Close">×</button>
      </div>

      <div className="quest-panel-body">
        {links.length > 0 ? (
          <div className="quest-panel-links">
            {links.map((r, i) => (
              <a
                key={i}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="quest-link-chip"
              >
                <span>{RESOURCE_ICONS[r.type] ?? '🔗'}</span>
                {linkLabel(r)}
              </a>
            ))}
          </div>
        ) : (
          <span className="quest-panel-hint">Open materials in Quest Log</span>
        )}
        {taskCount > 0 && (
          <span className="quest-panel-tasks">{taskCount} practice tasks</span>
        )}
      </div>

      <div className="quest-panel-footer">
        <div className="quest-reward-label">
          <span className="quest-reward-xp">+{topic.reward.xp} XP</span>
        </div>

        {isDone ? (
          <div className="quest-done-badge">✓ Done</div>
        ) : (
          <button className="quest-complete-btn" type="button" onClick={handleComplete}>
            Complete
          </button>
        )}
      </div>
    </div>
  );
}
