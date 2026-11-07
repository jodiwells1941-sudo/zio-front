"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getTradeMessages, type TradeMessageRow } from "@/app/api/trade";
import { useAuth } from "@/hooks/useAuth";
import { getTradeEcho } from "@/utils/tradeEcho";

export default function OrderChatLink({ tradeId }: { tradeId: number }) {
  const { user } = useAuth();
  const userId = Number(user?.id);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId || !tradeId) return;
    let active = true;
    let revision = 0;
    let requestId = 0;
    const unread = new Set<number>();
    const refresh = async () => {
      const request = ++requestId;
      const version = revision;
      try {
        const result = await getTradeMessages(tradeId);
        if (!active || request !== requestId || version !== revision) return;
        unread.clear();
        (result.data as TradeMessageRow[]).forEach(row => {
          if (Number(row.sender_id) !== userId && !row.read_at) unread.add(Number(row.id));
        });
        setCount(unread.size);
      } catch { /* Retain the current count during network interruptions. */ }
    };
    setCount(0);
    void refresh();
    const channel = getTradeEcho()?.private(`p2p-order.${tradeId}`);
    const onMessage = ({ data }: { data?: TradeMessageRow }) => {
      if (!data?.id || Number(data.sender_id) === userId || data.read_at) return;
      revision++;
      unread.add(Number(data.id));
      setCount(unread.size);
      void refresh();
    };
    const onRead = () => { void refresh(); };
    channel?.listen('.p2p-order-message.update', onMessage);
    window.addEventListener('trade-chat-read', onRead);
    window.addEventListener('focus', onRead);
    const poll = window.setInterval(() => { if (!document.hidden) void refresh(); }, 15000);
    return () => {
      active = false;
      window.clearInterval(poll);
      window.removeEventListener('trade-chat-read', onRead);
      window.removeEventListener('focus', onRead);
      channel?.stopListening('.p2p-order-message.update', onMessage);
    };
  }, [tradeId, userId]);

  return (
    <Link href={`/dashboard/local-buy-sell/chat-list?trade_id=${tradeId}`}
      className="chat-notification d-md-none"
      aria-label={count ? `Open chat, ${count} unread messages` : 'Open chat'}>
      <i className="fa-solid fa-message" aria-hidden="true" />
      {count > 0 && <span className="chat-badge" aria-live="polite">{count > 99 ? '99+' : count}</span>}
    </Link>
  );
}
