// content/player-detector.ts
var lastReport = 0;
function report() {
  const video = document.querySelector("video");
  const message = {
    type: "CLEARPLAY:PLAYER_STATE",
    available: Boolean(video && Number.isFinite(video.duration) && video.duration > 0),
    currentTime: video?.currentTime ?? 0,
    duration: Number.isFinite(video?.duration) ? video.duration : 0
  };
  void chrome.runtime.sendMessage(message);
}
for (const event of ["loadedmetadata", "playing", "pause", "seeked", "ended", "timeupdate"]) {
  document.addEventListener(event, () => {
    if (event === "timeupdate" && Date.now() - lastReport < 1e3) return;
    lastReport = Date.now();
    report();
  }, true);
}
report();
