export type SkipEffect = "instant" | "smooth" | "discreet";

let overlay: HTMLDivElement | null = null;

function getOverlay(): HTMLDivElement {
  if (overlay?.isConnected) return overlay;
  overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "fixed", inset: "0", background: "#000", opacity: "0",
    pointerEvents: "none", zIndex: "2147483646", transition: "opacity 160ms ease",
  });
  document.body.appendChild(overlay);
  return overlay;
}

export function transitionOut(video: HTMLVideoElement, effect: SkipEffect, done: () => void): void {
  if (effect === "instant") { done(); return; }
  const duration = effect === "smooth" ? 160 : 90;
  const previousVolume = video.muted ? 0 : video.volume;
  getOverlay().style.transition = `opacity ${duration}ms ease`;
  getOverlay().style.opacity = effect === "smooth" ? "0.85" : "0.6";
  video.volume = 0;
  window.setTimeout(() => done(), duration);
  void previousVolume;
}

export function transitionIn(video: HTMLVideoElement, effect: SkipEffect, done: () => void): void {
  if (effect === "instant") { done(); return; }
  const duration = effect === "smooth" ? 160 : 90;
  getOverlay().style.transition = `opacity ${duration}ms ease`;
  getOverlay().style.opacity = "0";
  video.volume = 1;
  window.setTimeout(() => done(), duration);
}
