"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getTradeEcho } from "@/utils/tradeEcho";
import { enableChatSound, notifyIncomingChat, playChatChime } from "@/utils/chatSound";

export default function IncomingChatSound() {
  const { user, isLoggedIn } = useAuth();
  const userId = Number(user?.id);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !userId) return;
    let active = true;
    const unlock = (event?: Event) => {
      if (event?.target instanceof Element && event.target.closest('[data-enable-chat-sound]')) return;
      void enableChatSound().then(enabled => { if (active) setReady(enabled); });
    };
    // Capture also works when a modal stops event propagation.
    window.addEventListener("pointerdown", unlock, true);
    window.addEventListener("keydown", unlock, true);
    window.addEventListener("touchend", unlock, true);
    if (navigator.userActivation?.hasBeenActive) unlock();

    const echo = getTradeEcho();
    const channelName = "chat-user." + userId;
    const channel = echo?.private(channelName);
    const onMessage = (payload: { data?: Parameters<typeof notifyIncomingChat>[0] }) => {
      if (payload?.data) notifyIncomingChat(payload.data, userId);
    };
    channel?.listen(".p2p-order-message.update", onMessage);
    return () => {
      active = false;
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
      window.removeEventListener("touchend", unlock, true);
      channel?.stopListening(".p2p-order-message.update", onMessage);
      echo?.leave(channelName);
      // Keep the unlocked audio context across navigation and Strict Mode remounts.
    };
  }, [isLoggedIn, userId]);

  if (!isLoggedIn || ready) return null;
  return (
    <button
      type="button"
      data-enable-chat-sound
      className="btn btn-warning btn-sm shadow"
      style={{ position: "fixed", right: 16, bottom: 90, zIndex: 1050 }}
      onClick={async () => {
        const enabled = await enableChatSound();
        setReady(enabled);
        setFailed(!enabled);
        if (enabled) playChatChime();
      }}
    >
      <i className="fa-solid fa-volume-high me-2" aria-hidden="true" />
      {failed ? "Sound blocked — tap to retry" : "Enable notification sound"}
    </button>
  );
}
