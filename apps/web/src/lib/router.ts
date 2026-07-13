import { useState, useEffect } from 'react';

export type Route =
  | { type: 'world' }
  | { type: 'region'; id: string }
  | { type: 'topic'; id: string };

function parseHash(): Route {
  const hash = window.location.hash.slice(1); // strip leading #
  if (!hash || hash === '/' || hash === '') return { type: 'world' };
  if (hash.startsWith('/region/')) return { type: 'region', id: hash.slice(8) };
  if (hash.startsWith('/topic/')) return { type: 'topic', id: hash.slice(7) };
  return { type: 'world' };
}

export interface Navigator {
  toWorld: () => void;
  toRegion: (id: string) => void;
  toTopic: (id: string) => void;
  back: () => void;
}

export function useRouter(): { route: Route; nav: Navigator } {
  const [route, setRoute] = useState<Route>(parseHash);

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const nav: Navigator = {
    toWorld: () => { window.location.hash = '/'; },
    toRegion: (id) => { window.location.hash = `/region/${id}`; },
    toTopic: (id) => { window.location.hash = `/topic/${id}`; },
    back: () => { window.history.back(); },
  };

  return { route, nav };
}
