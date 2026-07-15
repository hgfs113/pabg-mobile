import { useEffect, useState } from 'react';
import { useCampaign } from './store/campaign';
import { useRouter } from './lib/router';
import { useUI } from './store/ui';
import { useMultiplayer } from './store/multiplayer';
import { useWorldSync } from './hooks/useWorldSync';
import { useChatSync } from './hooks/useChatSync';
import WorldView from './views/WorldView';
import RegionView from './views/RegionView';
import QuestLog from './components/QuestLog';
import ChatPanel from './components/ChatPanel';
import LoginScreen from './components/LoginScreen';
import Logo from './components/Logo';

export default function App() {
  const { bundle, loading, error, load } = useCampaign();
  const { route, nav } = useRouter();
  const { questLogOpen } = useUI();
  const { currentPlayerId, ready, bootstrap } = useMultiplayer();

  useWorldSync();
  useChatSync();

  /** When the player clicks a quest in the log, we navigate to the region and
   *  pass the topic ID to RegionView so it auto-opens the QuestPanel. */
  const [pendingTopicId, setPendingTopicId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  useEffect(() => { void bootstrap(); }, [bootstrap]);

  if (loading || !ready || (!bundle && !error)) {
    return (
      <div className="splash">
        <Logo size="splash" />
        <div className="splash-sub">Loading campaign…</div>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="splash">
        <Logo size="splash" />
        <div className="splash-error">{error ?? 'Unknown error'}</div>
      </div>
    );
  }

  // Gate: show login if no session
  if (!currentPlayerId) {
    return <LoginScreen />;
  }

  /** Called from QuestLog when the player clicks a quest entry */
  const handleFocusQuest = (topicId: string, regionId: string) => {
    setPendingTopicId(topicId);
    nav.toRegion(regionId);
  };

  let view: React.ReactNode;

  if (route.type === 'region') {
    const region = bundle.regionById[route.id];
    if (region) {
      view = (
        <RegionView
          bundle={bundle}
          region={region}
          nav={nav}
          autoOpenTopicId={pendingTopicId}
        />
      );
    }
  }

  if (!view) {
    view = <WorldView bundle={bundle} nav={nav} />;
  }

  return (
    <>
      {view}
      <ChatPanel />
      {questLogOpen && (
        <QuestLog bundle={bundle} onFocusQuest={handleFocusQuest} />
      )}
    </>
  );
}
