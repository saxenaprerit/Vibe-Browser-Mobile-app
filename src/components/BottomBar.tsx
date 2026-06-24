import React, {useState} from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ConnectionQuality} from '../types/routing';

interface Props {
  currentUrl: string;
  isOnline: boolean;
  connectionQuality: ConnectionQuality;
  routingLabel: string;
  onSubmit: (query: string) => void;
}

function StatusLine({
  isOnline,
  connectionQuality,
  routingLabel,
}: Pick<Props, 'isOnline' | 'connectionQuality' | 'routingLabel'>) {
  if (!isOnline) {
    return (
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, styles.dotOffline]} />
        <Text style={styles.statusText}>Offline · using on-device AI</Text>
      </View>
    );
  }
  if (connectionQuality === 'weak') {
    return (
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, styles.dotWeak]} />
        <Text style={styles.statusText}>Weak signal · using on-device AI</Text>
      </View>
    );
  }
  // Online + strong: show routing label subtly
  return (
    <View style={styles.statusRow}>
      <View style={[styles.statusDot, styles.dotOnline]} />
      <Text style={[styles.statusText, styles.statusOnline]}>{routingLabel}</Text>
    </View>
  );
}

export default function BottomBar({
  currentUrl,
  isOnline,
  connectionQuality,
  routingLabel,
  onSubmit,
}: Props) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);

  function handleSubmit() {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText('');
    Keyboard.dismiss();
  }

  return (
    <View style={[styles.container, {paddingBottom: insets.bottom + 8}]}>
      <StatusLine
        isOnline={isOnline}
        connectionQuality={connectionQuality}
        routingLabel={routingLabel}
      />
      <View style={[styles.inputRow, focused && styles.inputRowFocused]}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Ask, search, or go to a site"
          placeholderTextColor="#aaa"
          returnKeyType="go"
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={handleSubmit}
        />
        <Pressable style={styles.micBtn} onPress={() => {}}>
          <Text style={styles.micIcon}>🎤</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
    paddingTop: 6,
    paddingHorizontal: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotOnline: {backgroundColor: '#34C759'},
  dotWeak: {backgroundColor: '#FF9500'},
  dotOffline: {backgroundColor: '#FF3B30'},
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  statusOnline: {
    color: '#aaa',
    fontWeight: '400',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputRowFocused: {
    borderColor: '#007AFF',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111',
  },
  micBtn: {
    marginLeft: 8,
  },
  micIcon: {
    fontSize: 18,
  },
});
