import type { ClearPlayMessage } from "../shared/messages";
import type { CategoryKey, CutManifest, FilterMode } from "../shared/manifest-engine";
import { SkipController } from "./skip-controller";

let lastReport = 0;
let controller: SkipController | null = null;
let currentVideo: HTMLVideoElement | null = null;

async function controllerFor(video: HTMLVideoElement): Promise<SkipController> {
  if (controller && currentVideo === video) return controller;
  controller?.stop();
  controller = new SkipController(video, () => {
    const state = (window as unknown as { __clearplay?: { enabled: boolean; mode: FilterMode; categories: CategoryKey[]; manifest: CutManifest | null } }).__clearplay;
    return {
      enabled: state?.enabled ?? false,
      mode: state?.mode ?? "full",
      categories: new Set<CategoryKey>(state?.categories ?? []),
      effect: "discreet",
      getManifest: () => state?.manifest ?? null,
    };
  });
  currentVideo = video;
  controller.start();
  return controller;
}

async function loadState(): Promise<void> {
  const stored = await chrome.storage.local.get(["state", "manifest", "filterMode", "categories"]);
  (window as unknown as { __clearplay?: unknown }).__clearplay = {
    enabled: stored.state?.enabled ?? false,
    mode: stored.filterMode ?? "full",
    categories: stored.categories ?? [],
    manifest: stored.manifest ?? null,
  };
}

void loadState();
chrome.storage.onChanged.addListener(() => { void loadState(); });

function report() {
  const video = document.querySelector("video") as HTMLVideoElement | null;
  if (video) void controllerFor(video);
  const message: ClearPlayMessage = {
    type: "CLEARPLAY:PLAYER_STATE",
    available: Boolean(video && Number.isFinite(video.duration) && video.duration > 0),
    currentTime: video?.currentTime ?? 0,
    duration: Number.isFinite(video?.duration) ? video!.duration : 0,
  };
  void chrome.runtime.sendMessage(message);
}

for (const event of ["loadedmetadata", "playing", "pause", "seeked", "ended", "timeupdate"]) {
  document.addEventListener(event, () => {
    if (event === "timeupdate" && Date.now() - lastReport < 1000) return;
    lastReport = Date.now();
    report();
  }, true);
}

report();
