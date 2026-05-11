"use client";

import { useTradeChat } from "@/hooks/useTradeChat";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function P2PChatPanel() {
  const searchParams = useSearchParams();
  const tradeIdParam = searchParams.get("trade_id");

  const tradeId = useMemo(() => {
    if (!tradeIdParam) return null;
    const n = Number(tradeIdParam);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [tradeIdParam]);

  const {
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
  } = useTradeChat(tradeId);

  const initials = counterpartyName.slice(0, 2).toUpperCase();

  if (!tradeId) {
    return (
      <div className="p2pChatWrap">
        <div className="p2pChatCard">
          <p className="text-muted small p-3 mb-0">Select a trade to use chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p2pChatWrap">
      <div className="p2pChatCard">
        <div className="p2pChatHeader">
          <div className="p2pChatAvatar">
            <span>{initials}</span>
          </div>
          <div className="p2pChatHeadText">
            <div className="p2pChatNameRow">
              <span className="p2pChatName">{counterpartyName}</span>
              <span className="p2pChatMeta">P2P trade chat</span>
            </div>
            <div className="p2pChatSub">
              <span className="dotOnline" /> Encrypted channel
            </div>
          </div>
        </div>

        {noticeOpen && (
          <div className="p2pChatNotice d-flex gap-2 align-items-center justify-content-between">
            <span className="d-flex gap-2 align-items-center">
              <i className="fa-regular fa-circle-question text-secondary" />
              <span>Keep all proof of payment in this chat. Images only (JPEG, PNG, WebP, GIF).</span>
            </span>
            <button
              className="p2pNoticeClose"
              type="button"
              aria-label="close notice"
              onClick={() => setNoticeOpen(false)}
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        )}

        <div className="p2pChatBody" ref={bodyRef}>
          {loading ? (
            <div className="p2pChatDay text-center">Loading…</div>
          ) : (
            <>
              {messages.map((m) => (
                <div key={m.id} className={`p2pMsg ${m.is_sender ? "self" : "other"}`}>
                  <div className="p2pMsgBubble">
                    {m.attachment && (
                      <a href={m.attachment} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.attachment} alt="attachment" className="p2pChatImg" />
                      </a>
                    )}
                    {m.message ? <div className="mt-1">{m.message}</div> : null}
                  </div>
                  <div className="p2pMsgTime">
                    {m.sender?.name ?? "User"} · {formatMsgTime(m.send_at || m.created_at)}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {pendingImage && (
          <div className="px-3 py-2 small text-white-50 border-top border-secondary border-opacity-25">
            Attached: {pendingImage.name}{" "}
            <button
              type="button"
              className="btn btn-link btn-sm text-danger p-0 ms-2"
              onClick={() => {
                setPendingImage(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
            >
              Remove
            </button>
          </div>
        )}

        <div className="p2pChatInputRow">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="d-none"
            onChange={(ev) => {
              const f = ev.target.files?.[0];
              setPendingImage(f ?? null);
            }}
          />
          <button
            className="p2pPlusBtn"
            type="button"
            aria-label="attach image"
            onClick={() => fileRef.current?.click()}
            disabled={sending}
          >
            <i className="fa-solid fa-plus" />
          </button>
          <input
            className="p2pChatInput"
            placeholder="Enter message here"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            disabled={sending}
          />
          <button
            className="p2pSendBtn"
            type="button"
            aria-label="send"
            disabled={sending || (!input.trim() && !pendingImage)}
            onClick={() => void send()}
          >
            <i className="fa-solid fa-paper-plane" />
          </button>
        </div>
      </div>
    </div>
  );
}
