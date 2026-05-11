"use client";

import Swal from "sweetalert2";
import { generateTradeReview } from "@/app/api/trade";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface FeedbackBoxProps {
  tradeId: number;
  buyerId: number;
  clientId: number;
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

export default function FeedbackBox({ tradeId, buyerId, clientId }: FeedbackBoxProps) {
  const [type, setType] = useState<"positive" | "negative" | "">("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const route = useRouter();

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

      await Swal.fire(
        "Review Submitted!",
        res?.message ?? "Thank you for your feedback.",
        "success"
      );

      setType("");
      setSelectedTags([]);
      setComment("");
      setErrors({});
      route.push("/dashboard/orders");

    } catch (error: any) {
      const data = error?.response?.data;
      if (data?.errors) {
        const serverErrors: FormErrors = {};
        Object.entries(data.errors).forEach(([key, msgs]) => {
          serverErrors[key as keyof FormErrors] = Array.isArray(msgs)
            ? (msgs as string[])[0]
            : String(msgs);
        });
        setErrors(serverErrors);
        Swal.fire("Validation Error", data?.message ?? "Please fix the errors.", "error");
      } else {
        Swal.fire("Error", data?.message ?? "Something went wrong. Try again.", "error");
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

  return (
    <div className="bg-dark p-3 rounded-3 mt-3">
      <h6 className="text-lg fw-6">Feedback</h6>
      <p className="text-white-50">Review Counterparty</p>

      {/* ── Positive / Negative ── */}
      <div className="pt-5 d-flex gap-3">
        <button
          type="button"
          onClick={() => handleTypeSelect("positive")}
          className="btn--primary py-2 px-3 text-sm d-flex align-items-center justify-content-center"
          style={type === "positive" ? activeStyle : {}}
        >
          <i className="fa-regular fa-thumbs-up pe-2" /> Positive
        </button>

        <button
          type="button"
          onClick={() => handleTypeSelect("negative")}
          className="btn--primary py-2 px-3 text-sm d-flex align-items-center justify-content-center"
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
            className="btn--secondary py-lg-2 py-1 px-3 rounded-2 m-2"
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
  );
}