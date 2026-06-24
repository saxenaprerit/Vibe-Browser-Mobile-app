import React from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

interface Props {
  tabCount: number;
  isLoading: boolean;
  loadProgress: Animated.Value;
  onTabsPress: () => void;
}

export default function TopBar({
  tabCount,
  isLoading,
  loadProgress,
  onTabsPress,
}: Props) {
  const insets = useSafeAreaInsets();

  const progressWidth = loadProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <View style={styles.bar}>
        <Pressable style={styles.tabsBtn} onPress={onTabsPress}>
          <Text style={styles.tabsIcon}>⊞</Text>
          <Text style={styles.tabsLabel}>
            Tabs{tabCount > 1 ? ` (${tabCount})` : ''}
          </Text>
        </Pressable>
      </View>
      {isLoading && (
        <Animated.View style={[styles.progressBar, {width: progressWidth}]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  bar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  tabsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabsIcon: {
    fontSize: 20,
    color: '#007AFF',
  },
  tabsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  progressBar: {
    height: 2,
    backgroundColor: '#007AFF',
  },
});
