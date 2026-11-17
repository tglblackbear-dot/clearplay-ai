// shared/manifest-engine.ts
function findActiveSegment(manifest, timeMs, categories, mode) {
  if (mode === "off" || manifest.status !== "verified") return null;
  return manifest.segments.find((segment) => {
    if (!categories.has(segment.category)) return false;
    if (mode === "partial" && segment.confidence < 0.8) return false;
    return timeMs >= segment.start_ms && timeMs < segment.end_ms;
  }) ?? null;
}

// content/transition-effects.ts
var overlay = null;
function getOverlay() {
  if (overlay?.isConnected) return overlay;
  overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    background: "#000",
    opacity: "0",
    pointerEvents: "none",
    zIndex: "2147483646",
    transition: "opacity 160ms ease"
  });
  document.body.appendChild(overlay);
  return overlay;
}
function transitionOut(video, effect, done) {
  if (effect === "instant") {
    done();
    return;
  }
  const duration = effect === "smooth" ? 160 : 90;
  const previousVolume = video.muted ? 0 : video.volume;
  getOverlay().style.transition = `opacity ${duration}ms ease`;
  getOverlay().style.opacity = effect === "smooth" ? "0.85" : "0.6";
  video.volume = 0;
  window.setTimeout(() => done(), duration);
}
function transitionIn(video, effect, done) {
  if (effect === "instant") {
    done();
    return;
  }
  const duration = effect === "smooth" ? 160 : 90;
  getOverlay().style.transition = `opacity ${duration}ms ease`;
  getOverlay().style.opacity = "0";
  video.volume = 1;
  window.setTimeout(() => done(), duration);
}

// content/skip-controller.ts
var SkipController = class {
  constructor(video, config) {
    this.video = video;
    this.config = config;
  }
  timer = null;
  lastSkipped = null;
  skipping = false;
  start() {
    this.stop();
    this.timer = window.setInterval(() => this.tick(), 400);
    this.video.addEventListener("seeked", this.onSeeked);
  }
  stop() {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.video.removeEventListener("seeked", this.onSeeked);
  }
  onSeeked = () => {
    this.lastSkipped = null;
  };
  tick() {
    if (this.skipping || this.video.paused) return;
    const settings = this.config();
    if (!settings.enabled) return;
    const manifest = settings.getManifest();
    if (!manifest) return;
    const timeMs = this.video.currentTime * 1e3;
    const segment = findActiveSegment(manifest, timeMs, settings.categories, settings.mode);
    if (!segment || segment.id === this.lastSkipped) return;
    this.skipping = true;
    transitionOut(this.video, settings.effect, () => {
      try {
        this.video.currentTime = Math.max(0, segment.end_ms / 1e3);
        this.lastSkipped = segment.id;
      } finally {
        transitionIn(this.video, settings.effect, () => {
          this.skipping = false;
        });
      }
    });
  }
};

// content/player-detector.ts
var lastReport = 0;
var controller = null;
var currentVideo = null;
async function controllerFor(video) {
  if (controller && currentVideo === video) return controller;
  controller?.stop();
  controller = new SkipController(video, () => {
    const state = window.__clearplay;
    return {
      enabled: state?.enabled ?? false,
      mode: state?.mode ?? "full",
      categories: new Set(state?.categories ?? []),
      effect: "discreet",
      getManifest: () => state?.manifest ?? null
    };
  });
  currentVideo = video;
  controller.start();
  return controller;
}
async function loadState() {
  const stored = await chrome.storage.local.get(["state", "manifest", "filterMode", "categories"]);
  window.__clearplay = {
    enabled: stored.state?.enabled ?? false,
    mode: stored.filterMode ?? "full",
    categories: stored.categories ?? [],
    manifest: stored.manifest ?? null
  };
}
void loadState();
chrome.storage.onChanged.addListener(() => {
  void loadState();
});
function report() {
  const video = document.querySelector("video");
  if (video) void controllerFor(video);
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
