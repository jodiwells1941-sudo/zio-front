"use client";

import Swal from "sweetalert2";
import { generateTradeReview } from "@/app/api/trade";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../FeedbackModal.module.css";

interface FeedbackBoxProps {
  tradeId: number;
  buyerId: number;
  clientId: number;
  from?: string;
}

interface FormErrors {
  type?: string;
  comment?: string;
}

const TAGS = [
  "Fast transaction",
  "Polite and friendly",
  "Patient",
  "Good price",
  "Safe and trustworthy",
];

export default function FeedbackBox({ tradeId, buyerId, clientId, from }: FeedbackBoxProps) {
  const [type, setType] = useState<"positive" | "negative" | "">("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isOpen, setIsOpen] = useState(true);
  const route = useRouter();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleTypeSelect = (val: "positive" | "negative") => {
    setType(val);
    setErrors((prev) => ({ ...prev, type: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!type) {
      newErrors.type = "Please select Positive or Negative before submitting.";
    }
    if (comment.trim().length > 0 && comment.trim().length < 5) {
      newErrors.comment = "Comment must be at least 5 characters.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      const payload = {
        type,
        tags: selectedTags,
        comment: comment.trim(),
        trade_id: tradeId,
        buyer_id: buyerId,
        client_id: clientId,
      };      

      const res = await generateTradeReview(payload);
      setIsOpen(false);

      await Swal.fire(
        "Review Submitted!",
        res?.message ?? "Thank you for your feedback.",
        "success"
      );

      setType("");
      setSelectedTags([]);
      setComment("");
      setErrors({});

      if (from == 'local') {
        route.replace("/dashboard/local-buy-sell/");
      } else {
        route.replace("/dashboard/orders");
      }

    } catch (err: unknown) {
      const data = (err as { response?: { data?: unknown } })?.response?.data;

      if (data && typeof data === 'object' && 'errors' in data) {
        const serverErrors: FormErrors = {};
        const errs = (data as { errors?: Record<string, string | string[]> }).errors;
        if (errs && typeof errs === 'object') {
          Object.entries(errs).forEach(([key, msgs]) => {
            serverErrors[key as keyof FormErrors] = Array.isArray(msgs)
              ? (msgs as string[])[0]
              : String(msgs);
          });
        }
        setErrors(serverErrors);
        const msg = (data as { message?: unknown }).message;
        const text = typeof msg === 'string'
          ? msg
          : (msg !== undefined && msg !== null ? String(msg) : "Please fix the errors.");
        await Swal.fire("Validation Error", text, "error");
      } else {
        const msg = data && typeof data === 'object' && 'message' in data
          ? String((data as { message?: unknown }).message)
          : "Something went wrong. Try again.";
        Swal.fire("Error", msg, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Shared active styles ─────────────────────────────────────────────────────
  const activeStyle: React.CSSProperties = {
    backgroundColor: "#f0a500",
    borderColor: "#f0a500",
    color: "#000",
  };

  const activeTagStyle: React.CSSProperties = {
    backgroundColor: "#f0a500",
    borderColor: "#f0a500",
    color: "#000",
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        className={styles.reopenButton}
        onClick={() => setIsOpen(true)}
      >
        Leave feedback
      </button>
    );
  }

  return (
    <div
      className={styles.overlay}
      onMouseDown={event => {
        if (event.target === event.currentTarget) setIsOpen(false);
      }}
    >
      <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="sell-feedback-title">
        <header className={styles.header}>
          <div>
            <h2 id="sell-feedback-title">Feedback</h2>
            <p>Review Counterparty</p>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={() => setIsOpen(false)}
            aria-label="Close feedback modal"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </header>
        <div className={styles.body}>

      {/* ── Positive / Negative ── */}
      <div className="pt-5 d-flex gap-3">
        <button
          type="button"
          onClick={() => handleTypeSelect("positive")}
          className={`border rounded-pill fs-6 py-2 px-3 d-flex align-items-center justify-content-center ${type === "positive" ? 'active' : ''}`}
          aria-pressed={type === "positive"}
          style={type === "positive" ? activeStyle : {}}
        >
          <i className="fa-regular fa-thumbs-up pe-2" /> Positive
        </button>

        <button
          type="button"
          onClick={() => handleTypeSelect("negative")}
          className={`border rounded-pill fs-6 py-2 px-3 d-flex align-items-center justify-content-center ${type === "negative" ? 'active' : ''}`}
          aria-pressed={type === "negative"}
          style={type === "negative" ? activeStyle : {}}
        >
          <i className="fa-regular fa-thumbs-down pe-2" /> Negative
        </button>
      </div>

      {errors.type && (
        <small className="text-danger d-block mt-2">{errors.type}</small>
      )}

      {/* ── Tags ── */}
      <div className="pt-4">
        {TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleTagClick(tag)}
            className={`btn--secondary py-lg-2 py-1 px-3 rounded-2 m-2 ${selectedTags.includes(tag) ? 'active' : ''}`}
            aria-pressed={selectedTags.includes(tag)}
            style={selectedTags.includes(tag) ? activeTagStyle : {}}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* ── Comment ── */}
      <div className="mt-3">
        <textarea
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            setErrors((prev) => ({ ...prev, comment: undefined }));
          }}
          className="copy-input px-3 form-control rounded-3 textarea-custom"
          placeholder={
            type === "negative"
              ? "Let other users know about the negative experience."
              : "Let other users know about the positive experience."
          }
          rows={4}
        />
        {errors.comment && (
          <small className="text-danger d-block mt-1">{errors.comment}</small>
        )}
      </div>

      {/* ── Submit ── */}
      <div className="d-flex justify-content-center mt-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="btn--primary text-sm d-flex align-items-center justify-content-center"
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              />
              Submitting...
            </>
          ) : (
            "Leave comments"
          )}
        </button>
      </div>
        </div>
      </section>
    </div>
  );
}