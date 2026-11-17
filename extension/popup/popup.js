// popup/popup.ts
var filter = document.getElementById("filter");
var player = document.getElementById("player");
var time = document.getElementById("time");
var toggle = document.getElementById("toggle");
function render(state) {
  filter.textContent = state?.enabled ? "Ativa" : "Desativada";
  player.textContent = state?.playerDetected ? "Sim" : "N\xE3o";
  const seconds = Math.floor(state?.currentTime ?? 0);
  time.textContent = state?.playerDetected ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}` : "\u2014";
}
async function refresh() {
  const response = await chrome.runtime.sendMessage({ type: "CLEARPLAY:PING" });
  render(response.state);
}
toggle.addEventListener("click", async () => {
  const response = await chrome.runtime.sendMessage({ type: "CLEARPLAY:PING" });
  const next = await chrome.runtime.sendMessage({ type: "CLEARPLAY:SET_ENABLED", enabled: !response.state?.enabled });
  render(next.state);
});
void refresh();
