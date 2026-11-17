import type { ClearPlayResponse } from "../shared/messages";

const filter = document.getElementById("filter")!;
const player = document.getElementById("player")!;
const time = document.getElementById("time")!;
const toggle = document.getElementById("toggle") as HTMLButtonElement;

function render(state: ClearPlayResponse["state"]) {
  filter.textContent = state?.enabled ? "Ativa" : "Desativada";
  player.textContent = state?.playerDetected ? "Sim" : "Não";
  const seconds = Math.floor(state?.currentTime ?? 0);
  time.textContent = state?.playerDetected ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}` : "—";
}

async function refresh() {
  const response = await chrome.runtime.sendMessage({ type: "CLEARPLAY:PING" }) as ClearPlayResponse;
  render(response.state);
}

toggle.addEventListener("click", async () => {
  const response = await chrome.runtime.sendMessage({ type: "CLEARPLAY:PING" }) as ClearPlayResponse;
  const next = await chrome.runtime.sendMessage({ type: "CLEARPLAY:SET_ENABLED", enabled: !response.state?.enabled }) as ClearPlayResponse;
  render(next.state);
});

void refresh();
