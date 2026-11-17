// background/service-worker.ts
var DEFAULT_STATE = {
  enabled: true,
  playerDetected: false,
  currentTime: 0,
  duration: 0
};
async function getState() {
  const stored = await chrome.storage.local.get("state");
  return { ...DEFAULT_STATE, ...stored.state ?? {} };
}
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    if (message.type === "CLEARPLAY:SET_ENABLED") {
      const state = await getState();
      const next = { ...state, enabled: message.enabled };
      await chrome.storage.local.set({ state: next });
      sendResponse({ ok: true, state: next });
      return;
    }
    if (message.type === "CLEARPLAY:PLAYER_STATE") {
      const state = await getState();
      const next = { ...state, playerDetected: message.available, currentTime: message.currentTime, duration: message.duration };
      await chrome.storage.local.set({ state: next });
      sendResponse({ ok: true, state: next });
      return;
    }
    if (message.type === "CLEARPLAY:PING") {
      sendResponse({ ok: true, state: await getState() });
    }
  })();
  return true;
});
