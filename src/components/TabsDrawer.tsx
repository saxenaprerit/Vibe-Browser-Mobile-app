import React, {useRef} from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {PrefetchStatus} from '../cache/usePrefetch';

export interface Tab {
  id: string;
  title: string;
  url: string;
}

interface Props {
  visible: boolean;
  tabs: Tab[];
  activeTabId: string;
  isOnline: boolean;
  getCacheStatus: (url: string) => PrefetchStatus;
  onSelectTab: (id: string) => void;
  onCacheTab: (tab: Tab) => void;
  onNewTab: () => void;
  onClose: () => void;
}

const DRAWER_WIDTH = Dimensions.get('window').width * 0.82;

function CacheHint({
  url,
  isOnline,
  status,
  onCache,
}: {
  url: string;
  isOnline: boolean;
  status: PrefetchStatus;
  onCache: () => void;
}) {
  if (!url) return null;

  if (status === 'cached') {
    return <Text style={styles.hintCached}>✓ Cached for offline</Text>;
  }
  if (status === 'fetching') {
    return <Text style={styles.hintFetching}>Caching…</Text>;
  }
  if (status === 'error') {
    return <Text style={styles.hintError}>Cache failed · tap to retry</Text>;
  }
  if (!isOnline) {
    return <Text style={styles.hintOffline}>Needs connection</Text>;
  }
  return (
    <Pressable onPress={onCache} hitSlop={8}>
      <Text style={styles.hintAction}>Save for offline</Text>
    </Pressable>
  );
}

export default function TabsDrawer({
  visible,
  tabs,
  activeTabId,
  isOnline,
  getCacheStatus,
  onSelectTab,
  onCacheTab,
  onNewTab,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: visible ? 0 : -DRAWER_WIDTH,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [visible, translateX]);

  return (
    <>
      {visible && (
        <Pressable style={styles.backdrop} onPress={onClose} />
      )}
      <Animated.View
        style={[
          styles.drawer,
          {
            width: DRAWER_WIDTH,
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 12,
            transform: [{translateX}],
          },
        ]}>
        <TextInput
          style={styles.search}
          placeholder="Search tabs"
          placeholderTextColor="#999"
          clearButtonMode="while-editing"
        />
        <FlatList
          data={tabs}
          keyExtractor={t => t.id}
          renderItem={({item}) => {
            const status = getCacheStatus(item.url);
            return (
              <Pressable
                style={[
                  styles.tabRow,
                  item.id === activeTabId && styles.tabRowActive,
                ]}
                onPress={() => {
                  onSelectTab(item.id);
                  onClose();
                }}>
                <Text style={styles.tabTitle} numberOfLines={1}>
                  {item.title || 'New Tab'}
                </Text>
                <Text style={styles.tabUrl} numberOfLines={1}>
                  {item.url || 'about:blank'}
                </Text>
                <CacheHint
                  url={item.url}
                  isOnline={isOnline}
                  status={status}
                  onCache={() => onCacheTab(item)}
                />
              </Pressable>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
        <Pressable style={styles.newTabBtn} onPress={onNewTab}>
          <Text style={styles.newTabText}>+ New Tab</Text>
        </Pressable>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 10,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: {width: 4, height: 0},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    paddingHorizontal: 16,
  },
  search: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    marginBottom: 12,
  },
  tabRow: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  tabRowActive: {
    backgroundColor: '#f0f4ff',
  },
  tabTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111',
  },
  tabUrl: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  hintCached: {fontSize: 11, color: '#34C759', marginTop: 3, fontWeight: '500'},
  hintFetching: {fontSize: 11, color: '#FF9500', marginTop: 3},
  hintError: {fontSize: 11, color: '#FF3B30', marginTop: 3},
  hintOffline: {fontSize: 11, color: '#aaa', marginTop: 3},
  hintAction: {fontSize: 11, color: '#007AFF', marginTop: 3, fontWeight: '500'},
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e5e5e5',
  },
  newTabBtn: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
  },
  newTabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
  },
});
