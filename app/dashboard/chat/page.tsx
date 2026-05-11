"use client";

import P2PTopNav from "@/components/dashboard/p2p/P2PTopNav";
import { chatAvatarColor } from "@/components/dashboard/chat/ChatData";
import { getTrades, type TradeListRow } from "@/app/api/trade";
import { useTradeChat } from "@/hooks/useTradeChat";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

function shortTime(dateStr: string): string {
  const d = new Date(dateStr.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return dateStr.slice(0, 10);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [trades, setTrades] = useState<TradeListRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTradeId, setActiveTradeId] = useState<number | null>(null);

  const chat = useTradeChat(activeTradeId);

  const loadTrades = useCallback(async () => {
    try {
      setListLoading(true);
      const res = await getTrades({ page: 1 });
      const paginated = res?.data as { data?: TradeListRow[] } | TradeListRow[] | undefined;
      const rows = Array.isArray(paginated) ? paginated : paginated?.data ?? [];
      setTrades(rows);
    } catch {
      toast.error("Failed to load trades.");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrades();
  }, [loadTrades]);

  useEffect(() => {
    const q = searchParams.get("trade_id");
    if (!q) return;
    const id = Number(q);
    if (Number.isFinite(id) && id > 0) setActiveTradeId(id);
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages, chat.loading, activeTradeId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return trades;
    return trades.filter(
      (t) =>
        t.counterparty.toLowerCase().includes(q) ||
        t.orderNumber.toLowerCase().includes(q) ||
        t.status_text?.toLowerCase().includes(q)
    );
  }, [trades, search]);

  const selectTrade = (id: number) => {
    setActiveTradeId(id);
    router.replace(`/dashboard/chat?trade_id=${id}`, { scroll: false });
  };

  const activeRow = trades.find((t) => t.id === activeTradeId);
  const headerName = activeRow?.counterparty ?? chat.counterpartyName;
  const headerInitials = headerName.slice(0, 2).toUpperCase();
  const headerBg = chatAvatarColor(headerName);

  return (
    <div className="p2pPage mt-5 border border-dark-light">
      <P2PTopNav />
      <div className="chat-page">
        <aside className="chat-sidebar">
          <div className="chat-search-wrapper">
            <i className="fa-solid fa-magnifying-glass chat-search-icon" />
            <input
              className="chat-search-input bg-dark border-dark-light"
              type="text"
              placeholder="Search by counterparty or order #"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="chat-contact-list">
            {listLoading ? (
              <p className="text-muted small px-3 py-2">Loading trades…</p>
            ) : filtered.length === 0 ? (
              <p className="text-muted small px-3 py-2">No trades found.</p>
            ) : (
              filtered.map((t) => {
                const initials = t.counterparty.slice(0, 2).toUpperCase();
                const bg = chatAvatarColor(t.counterparty);
                const preview = `${t.type} · ${t.status_text ?? "—"}`;
                return (
                  <div
                    key={t.id}
                    className={`chat-contact-item ${activeTradeId === t.id ? "active" : ""}`}
                    onClick={() => selectTrade(t.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        selectTrade(t.id);
                      }
                    }}
                  >
                    <div className="chat-avatar-wrapper">
                      <div className="chat-avatar" style={{ backgroundColor: bg }}>
                        {initials}
                      </div>
                    </div>
                    <div className="chat-contact-info">
                      <div className="chat-contact-top">
                        <span className="chat-contact-name">{t.counterparty}</span>
                        <span className="chat-contact-time">{shortTime(t.date)}</span>
                      </div>
                      <div className="chat-contact-bottom">
                        <span className="chat-contact-preview">
                          {t.orderNumber} — {preview}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        <main className={`chat-main ${activeTradeId ? "active" : ""}`}>
          {activeTradeId ? (
            <div className="chat-main-content">
              <div className="chat-main-header mt-100 mt-md-0 bg-dark">
                <button
                  type="button"
                  className="chat-mobile-close"
                  onClick={() => {
                    setActiveTradeId(null);
                    router.replace("/dashboard/chat", { scroll: false });
                  }}
                  aria-label="Back to list"
                >
                  <i className="fa-solid fa-arrow-left" />
                </button>

                <div className="chat-main-header-left">
                  <div className="chat-avatar-wrapper">
                    <div className="chat-avatar chat-avatar-md" style={{ backgroundColor: headerBg }}>
                      {headerInitials}
                    </div>
                  </div>
                  <div className="chat-main-header-info">
                    <span className="chat-main-header-name">{headerName}</span>
                    <span className="chat-main-header-status">
                      {activeRow?.orderNumber ?? chat.orderId ?? "Trade chat"}
                    </span>
                  </div>
                </div>

                <div className="chat-main-header-actions">
                  <button type="button" className="chat-icon-btn" title="Refresh" onClick={() => chat.reload()}>
                    <i className="fa-solid fa-rotate-right" />
                  </button>
                </div>
              </div>

              <div className="chat-messages-area">
                <div className="chat-messages-inner">
                  {chat.loading ? (
                    <p className="text-muted small p-3">Loading messages…</p>
                  ) : (
                    <>
                      {chat.orderId && (
                        <div className="chat-message-row them">
                          <div className="chat-bubble-wrapper">
                            <div className="chat-bubble chat-bubble-them">
                              Use reference <strong>{chat.orderId}</strong> in your payment description.
                            </div>
                            <span className="chat-msg-time">System</span>
                          </div>
                        </div>
                      )}
                      {chat.messages.map((m) => (
                        <div
                          key={m.id}
                          className={`chat-message-row ${m.is_sender ? "me" : "them"}`}
                        >
                          <div className="chat-bubble-wrapper">
                            <div
                              className={`chat-bubble ${
                                m.is_sender ? "chat-bubble-me" : "chat-bubble-them"
                              }`}
                            >
                              {m.attachment && (
                                <a href={m.attachment} target="_blank" rel="noopener noreferrer">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={m.attachment} alt="" className="chat-bubble-image" />
                                </a>
                              )}
                              {m.message ? <div>{m.message}</div> : null}
                            </div>
                            <span className="chat-msg-time">
                              {m.sender?.name ?? "—"} · {chat.formatMsgTime(m.send_at || m.created_at)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {chat.pendingImage && (
                <div className="px-3 py-2 small text-secondary border-top border-secondary border-opacity-25">
                  {chat.pendingImage.name}{" "}
                  <button
                    type="button"
                    className="btn btn-link btn-sm text-danger p-0 ms-2"
                    onClick={() => {
                      chat.setPendingImage(null);
                      if (chat.fileRef.current) chat.fileRef.current.value = "";
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}

              <div className="chat-input-area bg-dark">
                <div className="chat-input-row">
                  <input
                    ref={chat.fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="d-none"
                    onChange={(ev) => {
                      const f = ev.target.files?.[0];
                      chat.setPendingImage(f ?? null);
                    }}
                  />
                  <button
                    type="button"
                    className="chat-icon-btn chat-attach-btn"
                    title="Attach image"
                    onClick={() => chat.fileRef.current?.click()}
                    disabled={chat.sending}
                  >
                    <i className="fa-solid fa-paperclip" />
                  </button>
                  <input
                    className="chat-text-input"
                    type="text"
                    placeholder="Type a message…"
                    value={chat.input}
                    onChange={(e) => chat.setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void chat.send();
                    }}
                    disabled={chat.sending}
                  />
                  <button
                    type="button"
                    className={`chat-send-btn ${chat.input.trim() || chat.pendingImage ? "active" : ""}`}
                    onClick={() => void chat.send()}
                    disabled={chat.sending || (!chat.input.trim() && !chat.pendingImage)}
                    title="Send"
                  >
                    <i className="fa-solid fa-paper-plane" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="chat-empty-state">
              <div className="chat-empty-icon">
                <i className="fa-regular fa-comments" />
                <span className="chat-empty-smile">
                  <i className="fa-regular fa-face-smile" />
                </span>
              </div>
              <p className="chat-empty-title">P2P trade chat</p>
              <p className="chat-empty-sub">Choose a trade on the left to message your counterparty in real time.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
