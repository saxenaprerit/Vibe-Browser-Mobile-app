import React, {useCallback, useRef, useState} from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';
import WebView, {WebViewNavigation} from 'react-native-webview';
import BottomBar from '../components/BottomBar';
import TabsDrawer, {Tab} from '../components/TabsDrawer';
import TopBar from '../components/TopBar';
import {PageCache} from '../cache/PageCache';
import {usePrefetch} from '../cache/usePrefetch';
import {useConnectivity} from '../hooks/useConnectivity';
import {isNavigationUrl, resolveProvider} from '../engine/routingEngine';

let nextTabId = 1;
function makeTab(url = ''): Tab {
  return {id: String(nextTabId++), title: '', url};
}

export default function BrowserScreen() {
  const [tabs, setTabs] = useState<Tab[]>([makeTab('https://www.google.com')]);
  const [activeId, setActiveId] = useState(tabs[0].id);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const loadProgress = useRef(new Animated.Value(0)).current;

  const connectivity = useConnectivity();
  const routing = resolveProvider(connectivity);
  const {getStatus, prefetch, evict} = usePrefetch();
  const [offlineQueryMessage, setOfflineQueryMessage] = useState<string | null>(null);

  const activeTab = tabs.find(t => t.id === activeId) ?? tabs[0];

  const updateTab = useCallback((id: string, patch: Partial<Tab>) => {
    setTabs(prev => prev.map(t => (t.id === id ? {...t, ...patch} : t)));
  }, []);

  function getWebViewSource(tab: Tab) {
    if (!tab.url) return undefined;
    // Offline: serve from cache if available
    if (!connectivity.isOnline) {
      const cached = PageCache.get(tab.url);
      if (cached) {
        return {html: cached.html, baseUrl: tab.url};
      }
    }
    return {uri: tab.url};
  }

  function handleSubmit(query: string) {
    if (isNavigationUrl(query)) {
      const url = /^https?:\/\//i.test(query) ? query : `https://${query}`;
      updateTab(activeId, {url});
    } else if (!connectivity.isOnline) {
      // On-device AI not yet implemented — show placeholder until Foundation Models bridge is wired
      setOfflineQueryMessage(`On-device AI coming soon. Query: "${query}"`);
    } else {
      updateTab(activeId, {
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      });
    }
  }

  function handleNewTab() {
    const tab = makeTab();
    setTabs(prev => [...prev, tab]);
    setActiveId(tab.id);
    setDrawerOpen(false);
  }

  function handleNav(e: WebViewNavigation) {
    updateTab(activeId, {url: e.url, title: e.title});
  }

  function handleLoadStart() {
    setIsLoading(true);
    loadProgress.setValue(0);
    Animated.timing(loadProgress, {
      toValue: 0.8,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }

  function handleLoadEnd() {
    Animated.timing(loadProgress, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setIsLoading(false);
      loadProgress.setValue(0);
    });
  }

  const source = getWebViewSource(activeTab);

  return (
    <View style={styles.root}>
      <TopBar
        tabCount={tabs.length}
        isLoading={isLoading}
        loadProgress={loadProgress}
        onTabsPress={() => setDrawerOpen(o => !o)}
      />

      <View style={styles.webviewContainer}>
        {source ? (
          <WebView
            key={`${activeId}-${connectivity.isOnline}`}
            source={source}
            style={styles.webview}
            onNavigationStateChange={handleNav}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={() => setIsLoading(false)}
            onHttpError={() => setIsLoading(false)}
          />
        ) : (
          <View style={styles.newTabPlaceholder}>
            <Text style={styles.newTabHint}>Ask, search, or go to a site</Text>
          </View>
        )}
        {offlineQueryMessage && (
          <View style={styles.offlineQueryBanner}>
            <Text style={styles.offlineQueryText}>{offlineQueryMessage}</Text>
            <Text
              style={styles.offlineQueryDismiss}
              onPress={() => setOfflineQueryMessage(null)}>
              Dismiss
            </Text>
          </View>
        )}
      </View>

      <BottomBar
        currentUrl={activeTab.url}
        isOnline={connectivity.isOnline}
        connectionQuality={connectivity.connectionQuality}
        routingLabel={routing.label}
        onSubmit={handleSubmit}
      />

      <TabsDrawer
        visible={drawerOpen}
        tabs={tabs}
        activeTabId={activeId}
        isOnline={connectivity.isOnline}
        getCacheStatus={getStatus}
        onSelectTab={id => setActiveId(id)}
        onCacheTab={tab => prefetch(tab.url, tab.title)}
        onNewTab={handleNewTab}
        onClose={() => setDrawerOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#fff'},
  webviewContainer: {flex: 1},
  webview: {flex: 1},
  newTabPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newTabHint: {
    fontSize: 16,
    color: '#bbb',
  },
  offlineQueryBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1c1c1e',
    padding: 16,
    gap: 8,
  },
  offlineQueryText: {
    color: '#fff',
    fontSize: 14,
  },
  offlineQueryDismiss: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
