/** Broadcast when floating chat records activity (new chat, save to notes, etc.). */
export const ACTIVITY_RECORDED_EVENT = "vaxai-activity-recorded";

export type NotesSavedDetail = {
  contextType: string;
  contextId: string;
};

export const NOTES_SAVED_EVENT = "vaxai-notes-saved";

export function notifyActivityRecorded() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ACTIVITY_RECORDED_EVENT));
}

export function notifyNotesSaved(detail: NotesSavedDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<NotesSavedDetail>(NOTES_SAVED_EVENT, { detail }));
}

export function subscribeActivityRecorded(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(ACTIVITY_RECORDED_EVENT, handler);
  return () => window.removeEventListener(ACTIVITY_RECORDED_EVENT, handler);
}

export function subscribeNotesSaved(handler: (detail: NotesSavedDetail) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const wrapped = (event: Event) => {
    handler((event as CustomEvent<NotesSavedDetail>).detail);
  };
  window.addEventListener(NOTES_SAVED_EVENT, wrapped);
  return () => window.removeEventListener(NOTES_SAVED_EVENT, wrapped);
}