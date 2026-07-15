/**
 * QuestPanel — slides up from the bottom of the region map when the player
 * clicks a topic node. Shows all content in one place: description, study
 * resources (from theory encounters), tasks (from practice/review encounters).
 * One button to mark the whole quest complete.
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

function ResourceItem({ r }: { r: Resource }) {
  return (
    <li className="quest-resource-item">
      <span className="quest-resource-icon">{RESOURCE_ICONS[r.type] ?? '•'}</span>
      <div className="quest-resource-body">
        <div className="quest-resource-name">{r.title}</div>
        {r.ref && <div className="quest-resource-ref">{r.ref}</div>}
        {r.url && isExternalUrl(r.url) && (
          <a href={r.url} target="_blank" rel="noopener noreferrer" className="quest-resource-link">
            {r.title} ↗
          </a>
        )}
      </div>
    </li>
  );
}

export default function QuestPanel({ topic, regionName, regionColor, onClose }: Props) {
  const { completedTopics, completeTopic } = useProgress();

  const isDone = completedTopics.includes(topic.id);

  // Flatten encounter content into quest sections
  const studyResources = topic.encounters
    .filter((e) => e.type === 'theory')
    .flatMap((e) => e.resources ?? []);

  const practiceTasks = topic.encounters
    .filter((e) => e.type === 'practice')
    .flatMap((e) => e.tasks ?? []);

  const reviewTasks = topic.encounters
    .filter((e) => e.type === 'review')
    .flatMap((e) => e.tasks ?? []);

  const handleComplete = () => {
    completeTopic(topic.id, topic.reward.xp);
    onClose();
  };

  return (
    <>
      {/* dimming overlay */}
      <div className="map-dim" onClick={onClose} />

      <div className="quest-panel">
        <div className="quest-panel-handle" />

        {/* Header */}
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

        {/* Scrollable body */}
        <div className="quest-panel-body">
          {topic.description && (
            <p className="quest-description">{topic.description}</p>
          )}

          {studyResources.length > 0 && (
            <div className="quest-section">
              <div className="quest-section-label">Study</div>
              <ul className="quest-resources">
                {studyResources.map((r, i) => <ResourceItem key={i} r={r} />)}
              </ul>
            </div>
          )}

          {practiceTasks.length > 0 && (
            <div className="quest-section">
              <div className="quest-section-label">Practice</div>
              <ul className="quest-tasks">
                {practiceTasks.map((task, i) => (
                  <li key={i} className="quest-task-item">
                    <span className="quest-task-bullet" />
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {reviewTasks.length > 0 && (
            <div className="quest-section">
              <div className="quest-section-label">Reflect</div>
              <ul className="quest-tasks">
                {reviewTasks.map((task, i) => (
                  <li key={i} className="quest-task-item">
                    <span className="quest-task-bullet" />
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="quest-panel-footer">
          <div className="quest-reward-label">
            Reward:{' '}
            <span className="quest-reward-xp">+{topic.reward.xp} XP</span>
            {topic.reward.item && (
              <span className="quest-reward-item"> · {topic.reward.item}</span>
            )}
          </div>

          {isDone ? (
            <div className="quest-done-badge">✓ Completed</div>
          ) : (
            <button className="quest-complete-btn" onClick={handleComplete}>
              Mark Quest Complete
            </button>
          )}
        </div>
      </div>
    </>
  );
}
