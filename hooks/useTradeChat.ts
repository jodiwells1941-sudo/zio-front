"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  getTrade,
  getTradeMessages,
  sendTradeMessage,
  type TradeMessageRow,
} from "@/app/api/trade";
import { getUserInfo } from "@/utils/auth";
import { getTradeEcho } from "@/utils/tradeEcho";

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
      if (trade) {
        const cp =
          meId === trade.client_id ? trade.customer?.name : trade.client?.name;
        setCounterpartyName(cp || "Counterparty");
        setOrderId(trade.order_id ?? null);
      }
      const rows: TradeMessageRow[] = msgRes?.data ?? [];
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
    if (tradeId == null || tradeId < 1 || !meId) return;

    const echo = getTradeEcho();
    if (!echo) return;

    const channel = echo.private(`trade.${tradeId}`);
    const handler = (payload: { data: TradeMessageRow }) => {
      const row = payload?.data;
      if (!row?.id) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === row.id)) return prev;
        return [...prev, withSenderFlag(row, meId)];
      });
    };

    channel.listen(".p2p-order-message.update", handler);

    return () => {
      channel.stopListening(".p2p-order-message.update");
      echo.leave(`trade.${tradeId}`);
    };
  }, [tradeId, meId]);

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
