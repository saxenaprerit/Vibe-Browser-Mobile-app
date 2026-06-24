// In-memory page cache for simulator dev. Swap backing store for MMKV/AsyncStorage on device.
export interface CachedPage {
  url: string;
  html: string;
  title: string;
  cachedAt: number;
}

const store = new Map<string, CachedPage>();

export const PageCache = {
  save(page: CachedPage) {
    store.set(page.url, page);
  },

  get(url: string): CachedPage | null {
    return store.get(url) ?? null;
  },

  has(url: string): boolean {
    return store.has(url);
  },

  remove(url: string) {
    store.delete(url);
  },

  list(): CachedPage[] {
    return Array.from(store.values());
  },

  clear() {
    store.clear();
  },
};
