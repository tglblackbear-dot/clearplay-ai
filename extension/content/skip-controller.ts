import { findActiveSegment, type CategoryKey, type CutManifest, type FilterMode } from "../shared/manifest-engine";
import { transitionIn, transitionOut } from "./transition-effects";

export interface SkipConfig {
  enabled: boolean;
  mode: FilterMode;
  categories: Set<CategoryKey>;
  getManifest: () => CutManifest | null;
  effect: "instant" | "smooth" | "discreet";
}

export class SkipController {
  private timer: number | null = null;
  private lastSkipped: string | null = null;
  private skipping = false;

  constructor(private readonly video: HTMLVideoElement, private readonly config: () => SkipConfig) {}

  start(): void {
    this.stop();
    this.timer = window.setInterval(() => this.tick(), 400);
    this.video.addEventListener("seeked", this.onSeeked);
  }

  stop(): void {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.video.removeEventListener("seeked", this.onSeeked);
  }

  private onSeeked = (): void => {
    this.lastSkipped = null;
  };

  private tick(): void {
    if (this.skipping || this.video.paused) return;
    const settings = this.config();
    if (!settings.enabled) return;
    const manifest = settings.getManifest();
    if (!manifest) return;

    const timeMs = this.video.currentTime * 1000;
    const segment = findActiveSegment(manifest, timeMs, settings.categories, settings.mode);
    if (!segment || segment.id === this.lastSkipped) return;

    this.skipping = true;
    transitionOut(this.video, settings.effect, () => {
      try {
        this.video.currentTime = Math.max(0, segment.end_ms / 1000);
        this.lastSkipped = segment.id;
      } finally {
        transitionIn(this.video, settings.effect, () => { this.skipping = false; });
      }
    });
  }
}
