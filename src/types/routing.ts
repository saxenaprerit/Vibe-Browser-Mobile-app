export type AIProvider = 'on-device' | 'cloud' | 'none';

export type ConnectionQuality = 'strong' | 'weak' | 'offline';

export interface ConnectivityState {
  isOnline: boolean;
  connectionQuality: ConnectionQuality;
  connectionType: string | null;
}

export interface RoutingDecision {
  provider: AIProvider;
  reason: string;
  // Human-readable label shown in the model-transparency tag
  label: string;
}
