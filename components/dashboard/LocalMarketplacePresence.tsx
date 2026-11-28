"use client";

import { getUserInfo } from "@/utils/auth";
import { getTradeEcho } from "@/utils/tradeEcho";
import { touchLocalMarketplacePresence } from "@/app/api/p2padsapi";
import { createContext, useContext, useEffect, useState } from "react";

const PresenceContext = createContext<ReadonlySet<number>>(new Set());

const toUserIds = (users: unknown): Set<number> => {
  const list = Array.isArray(users)
    ? users
    : users && typeof users === "object"
      ? Object.values(users)
      : [];

  return new Set(
    list
      .filter(user => user && typeof user === "object")
      .map(user => Number((user as { id?: number | string }).id))
      .filter(id => Number.isSafeInteger(id) && id > 0)
  );
};

export function LocalMarketplacePresenceProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<number | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const syncUser = () => {
      const id = Number(getUserInfo()?.id);
      setUserId(Number.isSafeInteger(id) && id > 0 ? id : null);
    };

    syncUser();
    window.addEventListener("authStateChanged", syncUser);
    window.addEventListener("storage", syncUser);
    const poll = window.setInterval(syncUser, 1000);

    return () => {
      window.removeEventListener("authStateChanged", syncUser);
      window.removeEventListener("storage", syncUser);
      window.clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    if (userId === null) {
      setOnlineUserIds(new Set());
      return;
    }

    const echo = getTradeEcho();
    const heartbeat = () => {
      void touchLocalMarketplacePresence().catch(() => undefined);
    };
    heartbeat();
    // This provider is mounted at the app root, so a signed-in user stays
    // visible while browsing any page or keeping another tab open.
    const heartbeatTimer = window.setInterval(heartbeat, 20000);
    const heartbeatOnReturn = () => {
      if (document.visibilityState === "visible") heartbeat();
    };
    window.addEventListener("focus", heartbeatOnReturn);
    window.addEventListener("pageshow", heartbeatOnReturn);
    document.addEventListener("visibilitychange", heartbeatOnReturn);

    // Presence heartbeats must continue even when the websocket transport is
    // unavailable; the REST marketplace endpoint uses this cache to decide
    // which advertisers are active.
    if (!echo) {
      return () => {
        window.clearInterval(heartbeatTimer);
        window.removeEventListener("focus", heartbeatOnReturn);
        window.removeEventListener("pageshow", heartbeatOnReturn);
        document.removeEventListener("visibilitychange", heartbeatOnReturn);
      };
    }

    const channelName = "local-marketplace.presence";
    const channel = echo.join(channelName);

    channel.here((users: unknown) => setOnlineUserIds(toUserIds(users)));
    channel.joining((user: unknown) => {
      const id = Number((user as { id?: number | string } | null)?.id);
      if (!Number.isSafeInteger(id) || id < 1) return;
      setOnlineUserIds(current => new Set(current).add(id));
    });
    channel.leaving((user: unknown) => {
      const id = Number((user as { id?: number | string } | null)?.id);
      if (!Number.isSafeInteger(id) || id < 1) return;
      setOnlineUserIds(current => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    });

    return () => {
      window.clearInterval(heartbeatTimer);
      window.removeEventListener("focus", heartbeatOnReturn);
      window.removeEventListener("pageshow", heartbeatOnReturn);
      document.removeEventListener("visibilitychange", heartbeatOnReturn);
      echo.leave(channelName);
      setOnlineUserIds(new Set());
    };
  }, [userId]);

  return <PresenceContext.Provider value={onlineUserIds}>{children}</PresenceContext.Provider>;
}

export function useLocalMarketplacePresence(): ReadonlySet<number> {
  return useContext(PresenceContext);
}
