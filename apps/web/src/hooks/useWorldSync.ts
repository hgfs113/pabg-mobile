import { useEffect } from 'react';
import { useMultiplayer } from '../store/multiplayer';

const SYNC_MS = 3000;

/** Poll shared world state from the server. */
export function useWorldSync() {
  const ready = useMultiplayer((s) => s.ready);
  const currentPlayerId = useMultiplayer((s) => s.currentPlayerId);
  const syncWorld = useMultiplayer((s) => s.syncWorld);

  useEffect(() => {
    if (!ready) return;

    void syncWorld();
    const id = window.setInterval(() => void syncWorld(), SYNC_MS);
    return () => window.clearInterval(id);
  }, [ready, currentPlayerId, syncWorld]);
}
