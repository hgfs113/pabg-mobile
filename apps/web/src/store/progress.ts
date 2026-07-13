/**
 * Compatibility shim — delegates to useMultiplayer.
 * All existing code that imports useProgress continues to work unchanged.
 */
import { useMultiplayer, currentProgress } from './multiplayer';

export function useProgress() {
  const state = useMultiplayer();
  const p     = currentProgress(state);

  return {
    completedTopics:      p.completedTopics,
    acceptedTopics:       p.acceptedTopics,
    xp:                   p.xp,
    lastCompletedTopicId: p.lastCompletedTopicId,
    lastVisitedRegionId:  p.lastVisitedRegionId,
    acceptTopic:          state.acceptTopic,
    completeTopic:        state.completeTopic,
    visitRegion:          state.visitRegion,
    reset:                state.resetProgress,
  };
}
