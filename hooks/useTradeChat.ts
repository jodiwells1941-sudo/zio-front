"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  getTrade,
  getTradeMessages,
  markTradeMessagesRead,
  sendTradeMessage,
  type TradeMessageRow,
} from "@/app/api/trade";
import { getUserInfo } from "@/utils/auth";
import { getTradeEcho } from "@/utils/tradeEcho";
import { notifyIncomingChat } from "@/utils/chatSound";

function formatMsgTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function withSenderFlag(row: TradeMessageRow, meId: number | undefined): TradeMessageRow {
  return {
    ...row,
    is_sender: meId != null && row.sender_id === meId,
  };
}

export function useTradeChat(tradeId: number | null) {
  const [counterpartyName, setCounterpartyName] = useState("Counterparty");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [messages, setMessages] = useState<TradeMessageRow[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(true);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const loadedMessageIds = useRef(new Map<string, Set<number>>());

  const me = getUserInfo();
  const meId: number | undefined = me?.id;

  const scrollBottom = () => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  const loadThread = useCallback(async () => {
    if (tradeId == null || tradeId < 1 || !Number.isFinite(tradeId)) {
      setLoading(false);
      setMessages([]);
      setOrderId(null);
      setCounterpartyName("Counterparty");
      return;
    }
    try {
      setLoading(true);
      const [tradeRes, msgRes] = await Promise.all([getTrade(tradeId), getTradeMessages(tradeId)]);
      const trade = tradeRes?.data;
      // console.log('trade ===', trade);
      
      if (trade) {

        if (trade.type === 'sell') {
          // const cp = meId === trade.client_id ? trade.customer?.name : trade.client?.name;
          const cp = meId === trade.client_id ? trade.merchant?.name ? trade.merchant?.name : trade.customer?.name : trade.client?.name;
          // const cp = meId === trade.client_id ? trade.merchant?.name : trade.client?.name;
          setCounterpartyName(cp || "Counterparty");
        }else{
          // const cp = meId === trade.client_id ? trade.customer?.name : trade.merchant?.name;
          const cp = meId === trade.client_id ? trade.customer?.name : trade.merchant?.name ? trade.merchant?.name : trade.client?.name;
          setCounterpartyName(cp || "Counterparty");
        }

        setOrderId(trade.order_id ?? null);
      }
      const rows: TradeMessageRow[] = msgRes?.data ?? [];
      const scope = `${meId}:${tradeId}`;
      const known = loadedMessageIds.current.get(scope);
      // The first history response is silent; subsequent new messages can chime.
      if (known && meId) {
        rows.forEach(row => {
          if (!known.has(Number(row.id))) notifyIncomingChat(row, meId);
        });
      }
      loadedMessageIds.current.set(scope, new Set(rows.map(row => Number(row.id))));
      setMessages(rows.map((r) => withSenderFlag(r, meId)));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load chat.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [tradeId, meId]);

  useEffect(() => {
    loadThread();
  }, [loadThread]);

  useEffect(() => {
    scrollBottom();
  }, [messages]);

  useEffect(() => {
    if (!tradeId || !meId || !messages.length) return;
    const currentMessages = messages.filter(row => Number(row.trade_id) === Number(tradeId));
    if (!currentMessages.length) return;
    const throughId = Math.max(...currentMessages.map(row => Number(row.id)));
    let saving = false;
    let saved = false;
    const markVisibleRead = async () => {
      const body = bodyRef.current;
      // The desktop chat panel remains mounted but is hidden on mobile.
      if (document.hidden || !body || body.getClientRects().length === 0 || saving || saved) return;
      if (!currentMessages.some(row => Number(row.sender_id) !== Number(meId) && !row.read_at)) return;
      saving = true;
      try {
        await markTradeMessagesRead(tradeId, throughId);
        saved = true;
        window.dispatchEvent(new Event('trade-chat-read'));
      } catch { /* Retry when the conversation refreshes or becomes visible. */ }
      finally { saving = false; }
    };
    void markVisibleRead();
    const onVisible = () => { void markVisibleRead(); };
    window.addEventListener('focus', onVisible);
    window.addEventListener('resize', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onVisible);
      window.removeEventListener('resize', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [tradeId, meId, messages]);

  useEffect(() => {
    if (tradeId == null || tradeId < 1 || !meId) return;

    const echo = getTradeEcho();
    const channelName = `p2p-order.${tradeId}`;
    const channel = echo?.private(channelName);
    const handler = (payload: { data: TradeMessageRow }) => {
      const row = payload?.data;
      if (!row?.id) return;
      notifyIncomingChat(row, meId);
      setMessages((prev) => {
        if (prev.some((m) => m.id === row.id)) return prev;
        return [...prev, withSenderFlag(row, meId)];
      });
    };

    const onDetailsUpdate = () => {
      void loadThread();
    };
    channel?.listen(".p2p-order-message.update", handler);
    channel?.listen(".p2p-order-details.update", onDetailsUpdate);

    // Reverb is the primary transport, but a short fallback keeps the chat
    // correct after a reconnect or a mobile network handoff.
    const fallback = window.setInterval(() => {
      if (document.visibilityState !== "hidden") void loadThread();
    }, 15000);

    return () => {
      channel?.stopListening(".p2p-order-message.update", handler);
      channel?.stopListening(".p2p-order-details.update", onDetailsUpdate);
      window.clearInterval(fallback);
    };
  }, [tradeId, meId, loadThread]);

  const send = async () => {
    if (tradeId == null || tradeId < 1) {
      toast.error("Select a trade to chat.");
      return;
    }
    if (!input.trim() && !pendingImage) return;

    setSending(true);
    try {
      const res = await sendTradeMessage(tradeId, { message: input, attachment: pendingImage });
      const row: TradeMessageRow | undefined = res?.data;
      if (row) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === row.id)) return prev;
          return [...prev, withSenderFlag(row, meId)];
        });
      }
      setInput("");
      setPendingImage(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err?.response?.data?.message ?? err?.message ?? "Send failed.");
    } finally {
      setSending(false);
    }
  };

  return {
    counterpartyName,
    orderId,
    messages,
    loading,
    sending,
    input,
    setInput,
    pendingImage,
    setPendingImage,
    noticeOpen,
    setNoticeOpen,
    send,
    fileRef,
    bodyRef,
    formatMsgTime,
    reload: loadThread,
  };
}

export type UseTradeChatReturn = ReturnType<typeof useTradeChat>;
