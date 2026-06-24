/** Broadcast when floating chat records activity (new chat, save to notes, etc.). */
export const ACTIVITY_RECORDED_EVENT = "vaxai-activity-recorded";

export function notifyActivityRecorded() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ACTIVITY_RECORDED_EVENT));
}

export function subscribeActivityRecorded(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(ACTIVITY_RECORDED_EVENT, handler);
  return () => window.removeEventListener(ACTIVITY_RECORDED_EVENT, handler);
}