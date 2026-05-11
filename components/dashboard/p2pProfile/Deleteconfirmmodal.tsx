"use client";

import React from "react";
import { DeleteConfirmModalProps } from "@/types/P2PProfileTypes";

type DeleteConfirmModalComponentProps = DeleteConfirmModalProps & {
  methodType?: string;
};

export default function DeleteConfirmModal({
  methodType = "selected",
  onClose,
  onConfirm,
}: DeleteConfirmModalComponentProps): React.JSX.Element {
  return (
    <div className="rt-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="del-modal-title">
      {/* Backdrop */}
      <button
        className="rt-modal-backdrop"
        type="button"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className="bg-light-white rt-modal--sm">
        {/* ── Head ── */}
        <div className="rt-modal-head">
          <h6 className="rt-modal-title" id="del-modal-title">
            Remove Payment Method
          </h6>
          <button
            type="button"
            className="rt-modal-x"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* ── Body ── */}
        <div className="rt-modal-body">
          <div className="p2p-delete-body">
            <div className="p2p-delete-icon">
              <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
            </div>
            <p className="p2p-delete-msg">
              Are you sure you want to remove your
              <strong>{methodType}</strong> payment method?
              <br />
              <span className="p2p-delete-sub">This action cannot be undone.</span>
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="rt-modal-foot">
          <button
            type="button"
            className="ticket-action-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn--danger py-2 px-3 text-sm d-flex align-items-center justify-content-center"
            onClick={onConfirm}
          >
            <i className="fa-solid fa-trash me-2" aria-hidden="true" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}