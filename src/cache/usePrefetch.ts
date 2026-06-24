import {useCallback, useState} from 'react';
import {PageCache} from './PageCache';

export type PrefetchStatus = 'idle' | 'fetching' | 'cached' | 'error';

// Injects a script into the WebView to grab the full HTML, then saves it.
// Called from BrowserScreen when the user taps "Cache for offline".
export function usePrefetch() {
  const [statusMap, setStatusMap] = useState<Record<string, PrefetchStatus>>({});

  const getStatus = useCallback(
    (url: string): PrefetchStatus => {
      if (statusMap[url]) return statusMap[url];
      return PageCache.has(url) ? 'cached' : 'idle';
    },
    [statusMap],
  );

  const prefetch = useCallback(async (url: string, title: string) => {
    if (!url || PageCache.has(url)) return;

    setStatusMap(prev => ({...prev, [url]: 'fetching'}));
    try {
      const res = await fetch(url, {
        headers: {'User-Agent': 'VibeBrowser/1.0 (offline-cache)'},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      PageCache.save({url, html, title, cachedAt: Date.now()});
      setStatusMap(prev => ({...prev, [url]: 'cached'}));
    } catch {
      setStatusMap(prev => ({...prev, [url]: 'error'}));
    }
  }, []);

  const evict = useCallback((url: string) => {
    PageCache.remove(url);
    setStatusMap(prev => ({...prev, [url]: 'idle'}));
  }, []);

  return {getStatus, prefetch, evict};
}
