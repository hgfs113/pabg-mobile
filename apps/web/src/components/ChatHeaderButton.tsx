import { useChat } from '../store/chat';
import { useUI } from '../store/ui';
import { useMultiplayer } from '../store/multiplayer';

export default function ChatHeaderButton() {
  const { chatOpen, toggleChat } = useUI();
  const messages = useChat((s) => s.messages);
  const lastReadAt = useChat((s) => s.lastReadAt);
  const { currentPlayerId } = useMultiplayer();

  const hasUnread =
    !chatOpen &&
    messages.some(
      (m) => m.playerId !== currentPlayerId && m.sentAt > lastReadAt,
    );

  return (
    <button
      type="button"
      className={`map-quest-btn${chatOpen ? ' active' : ''}${hasUnread ? ' unread' : ''}`}
      onClick={toggleChat}
    >
      Chat
    </button>
  );
}
