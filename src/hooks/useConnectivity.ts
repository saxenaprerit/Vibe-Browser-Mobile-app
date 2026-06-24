import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {useEffect, useRef, useState} from 'react';
import {ConnectivityState} from '../types/routing';

const OFFLINE_DEBOUNCE_MS = 1500; // avoid flicker on brief drops

function stateFromNetInfo(info: NetInfoState): ConnectivityState {
  const isOnline = !!info.isConnected && !!info.isInternetReachable;

  let connectionQuality: ConnectivityState['connectionQuality'] = 'offline';
  if (isOnline) {
    const type = info.type;
    if (type === 'wifi' || type === 'ethernet') {
      connectionQuality = 'strong';
    } else if (type === 'cellular') {
      // @ts-ignore – details exist on cellular type
      const gen = info.details?.cellularGeneration;
      connectionQuality = gen === '2g' ? 'weak' : 'strong';
    } else {
      connectionQuality = 'weak';
    }
  }

  return {
    isOnline,
    connectionQuality,
    connectionType: info.type ?? null,
  };
}

export function useConnectivity(): ConnectivityState {
  const [state, setState] = useState<ConnectivityState>({
    isOnline: true, // optimistic default until first event
    connectionQuality: 'strong',
    connectionType: null,
  });

  const offlineTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(info => {
      const next = stateFromNetInfo(info);

      if (!next.isOnline) {
        // Debounce going offline to avoid flicker on brief interruptions
        if (!offlineTimer.current) {
          offlineTimer.current = setTimeout(() => {
            setState(next);
            offlineTimer.current = null;
          }, OFFLINE_DEBOUNCE_MS);
        }
      } else {
        // Coming back online: cancel any pending offline transition immediately
        if (offlineTimer.current) {
          clearTimeout(offlineTimer.current);
          offlineTimer.current = null;
        }
        setState(next);
      }
    });

    // Fetch current state immediately on mount
    NetInfo.fetch().then(info => setState(stateFromNetInfo(info)));

    return () => {
      unsubscribe();
      if (offlineTimer.current) clearTimeout(offlineTimer.current);
    };
  }, []);

  return state;
}
