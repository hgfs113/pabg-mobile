import { useEffect } from 'react';
import { useChat } from '../store/chat';

const SYNC_MS = 3000;

export function useChatSync() {
  const sync = useChat((s) => s.sync);

  useEffect(() => {
    void sync();
    const id = window.setInterval(() => void sync(), SYNC_MS);
    return () => window.clearInterval(id);
  }, [sync]);
}
