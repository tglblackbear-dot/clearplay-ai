import type { ClearPlayMessage, ClearPlayResponse, ExtensionState } from "../shared/messages";

const DEFAULT_STATE: ExtensionState = {
  enabled: true,
  playerDetected: false,
  currentTime: 0,
  duration: 0,
};

async function getState(): Promise<ExtensionState> {
  const stored = await chrome.storage.local.get("state");
  return { ...DEFAULT_STATE, ...(stored.state ?? {}) };
}

chrome.runtime.onMessage.addListener((message: ClearPlayMessage, _sender, sendResponse) => {
  (async () => {
    if (message.type === "CLEARPLAY:SET_ENABLED") {
      const state = await getState();
      const next = { ...state, enabled: message.enabled };
      await chrome.storage.local.set({ state: next });
      sendResponse({ ok: true, state: next } satisfies ClearPlayResponse);
      return;
    }
    if (message.type === "CLEARPLAY:PLAYER_STATE") {
      const state = await getState();
      const next = { ...state, playerDetected: message.available, currentTime: message.currentTime, duration: message.duration };
      await chrome.storage.local.set({ state: next });
      sendResponse({ ok: true, state: next } satisfies ClearPlayResponse);
      return;
    }
    if (message.type === "CLEARPLAY:PING") {
      sendResponse({ ok: true, state: await getState() } satisfies ClearPlayResponse);
    }
  })();
  return true;
});
