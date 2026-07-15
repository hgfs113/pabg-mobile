import { useEffect, useRef, useState } from 'react';
import { useChat } from '../store/chat';
import { useUI } from '../store/ui';
import { useMultiplayer } from '../store/multiplayer';

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatPanel() {
  const { chatOpen, toggleChat } = useUI();
  const { messages, send, sending } = useChat();
  const { currentPlayerId } = useMultiplayer();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatOpen || !scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatOpen, messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await send(draft);
    if (ok) setDraft('');
  };

  return (
    <>
      <button
        type="button"
        className={`chat-toggle-btn${chatOpen ? ' active' : ''}`}
        onClick={toggleChat}
        title={chatOpen ? 'Hide chat' : 'Open chat'}
        aria-label={chatOpen ? 'Hide chat' : 'Open chat'}
      >
        💬
      </button>

      <div className={`chat-panel${chatOpen ? ' open' : ''}`}>
        <div className="chat-header">
          <span className="chat-title">Chat</span>
          <button type="button" className="chat-close" onClick={toggleChat} aria-label="Close">×</button>
        </div>

        <div className="chat-messages" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="chat-empty">No messages yet. Say hello!</div>
          ) : (
            messages.map((m) => {
              const mine = m.playerId === currentPlayerId;
              return (
                <div key={m.id} className={`chat-msg${mine ? ' mine' : ''}`}>
                  <div className="chat-msg-meta">
                    <span className="chat-msg-name" style={{ color: m.playerColor }}>
                      {m.playerName}
                    </span>
                    <span className="chat-msg-time">{formatTime(m.sentAt)}</span>
                  </div>
                  <div className="chat-msg-text">{m.text}</div>
                </div>
              );
            })
          )}
        </div>

        <form className="chat-input-row" onSubmit={handleSubmit}>
          <input
            className="chat-input"
            type="text"
            placeholder="Type a message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={400}
            disabled={sending}
          />
          <button className="chat-send" type="submit" disabled={sending || !draft.trim()}>
            →
          </button>
        </form>
      </div>
    </>
  );
}
