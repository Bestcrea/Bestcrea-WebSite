export const OPEN_CHAT_EVENT = "bestcrea:open-chat";

export function openChatWidget() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT));
}
