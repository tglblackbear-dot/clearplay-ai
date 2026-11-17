export type ClearPlayMessage =
  | { type: "CLEARPLAY:PING" }
  | { type: "CLEARPLAY:PLAYER_STATE"; available: boolean; currentTime: number; duration: number }
  | { type: "CLEARPLAY:SET_ENABLED"; enabled: boolean };

export type ClearPlayResponse = { ok: boolean; state?: ExtensionState };

export interface ExtensionState {
  enabled: boolean;
  playerDetected: boolean;
  currentTime: number;
  duration: number;
}
