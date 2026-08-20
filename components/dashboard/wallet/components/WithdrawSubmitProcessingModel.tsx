'use client';

import React, { useEffect, useMemo, useState } from 'react';

export interface WithdrawalModalData {
  message: string;
  amount: number;
  fee: number;
  receiveAmount: number;
  paymentMethod: string;
  coin: string;
  network: string;
  networkLabel: string;
  walletAddress: string;
  binanceId: string;
  transactionId: string;
  requestedAt: string;
  estimatedCompletion: string;
  status: string;
}

interface WithdrawSubmitProcessingModelProps {
  open: boolean;
  data: WithdrawalModalData;
  onClose: () => void;
}

const maskValue = (value: string, start = 7, end = 7) => {
  if (!value) return 'Pending';
  if (value.length <= start + end) return value;
  return `${value.slice(0, start)}...${value.slice(-end)}`;
};

const getStatusText = (status: string) => {
  const normalized = String(status || '').toLowerCase();

  if (
    normalized.includes('complete') ||
    normalized.includes('success') ||
    normalized === '2'
  ) {
    return 'Completed';
  }

  if (
    normalized.includes('verify') ||
    normalized.includes('review')
  ) {
    return 'Verifying';
  }

  return 'Processing';
};

export default function WithdrawSubmitProcessingModel({
  open,
  data,
  onClose,
}: WithdrawSubmitProcessingModelProps) {
  const [notifyWhenCompleted, setNotifyWhenCompleted] = useState(true);
  const [copiedField, setCopiedField] = useState('');

  const currentStatus = useMemo(
    () => getStatusText(data.status),
    [data.status]
  );

  const isBinance = data.paymentMethod === 'binance';

  const progressLevel =
    currentStatus === 'Completed'
      ? 4
      : currentStatus === 'Verifying'
        ? 3
        : 2;

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  const copyText = async (field: string, value: string) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);

      window.setTimeout(() => {
        setCopiedField('');
      }, 1400);
    } catch {
      setCopiedField('');
    }
  };

  if (!open) return null;

  return (
    <div
      className="wsp-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="withdraw-processing-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="wsp-modal">
        <button
          type="button"
          className="wsp-close"
          onClick={onClose}
          aria-label="Close withdrawal processing modal"
        >
          <i className="fa-solid fa-xmark" />
        </button>

        <section className="wsp-header">
          <div className="wsp-hero-art" aria-hidden="true">
            <span className="wsp-orbit orbit-one" />
            <span className="wsp-orbit orbit-two" />
            <span className="wsp-orbit-dot dot-one" />
            <span className="wsp-orbit-dot dot-two" />
            <span className="wsp-orbit-dot dot-three" />

            <div className="wsp-wallet">
              <i className="fa-solid fa-wallet" />
            </div>

            <span className="wsp-hourglass">
              <i className="fa-solid fa-hourglass-half" />
            </span>
          </div>

          <div className="wsp-heading">
            <span className="wsp-processing-badge">
              <span className="wsp-spinner wsp-spinner-sm" />
              {currentStatus}
            </span>

            <h2 id="withdraw-processing-title">
              {currentStatus === 'Completed' ? (
                <>
                  Withdrawal <span>Completed</span>
                </>
              ) : (
                <>
                  Processing <span>Withdrawal</span>
                </>
              )}
            </h2>

            <p>
              {data.message ||
                'Your withdrawal request is being processed securely.'}
            </p>
          </div>
        </section>

        <section className="wsp-progress" aria-label="Withdrawal progress">
          <div className="wsp-progress-track">
            <span
              className="wsp-progress-fill"
              style={{
                width:
                  progressLevel === 4
                    ? '100%'
                    : progressLevel === 3
                      ? '66.66%'
                      : '33.33%',
              }}
            />
          </div>

          {[
            {
              title: 'Request Received',
              subtitle: data.requestedAt,
              icon: 'fa-paper-plane',
            },
            {
              title: 'Processing',
              subtitle: progressLevel >= 2 ? 'In Progress' : 'Pending',
              icon: 'fa-gear',
            },
            {
              title: 'Verifying',
              subtitle: progressLevel >= 3 ? 'In Progress' : 'Pending',
              icon: 'fa-shield-halved',
            },
            {
              title: 'Completed',
              subtitle: progressLevel >= 4 ? 'Completed' : 'Pending',
              icon: 'fa-check',
            },
          ].map((step, index) => {
            const stepNumber = index + 1;
            const isDone = stepNumber < progressLevel;
            const isActive = stepNumber === progressLevel;

            return (
              <div
                className={`wsp-step ${isDone ? 'done' : ''} ${
                  isActive ? 'active' : ''
                }`}
                key={step.title}
              >
                <div className="wsp-step-icon">
                  <i className={`fa-solid ${step.icon}`} />

                  {isDone && (
                    <span className="wsp-step-check">
                      <i className="fa-solid fa-check" />
                    </span>
                  )}
                </div>

                <strong>{step.title}</strong>
                <small>{step.subtitle}</small>
              </div>
            );
          })}
        </section>

        <section className="wsp-content-grid">
          <article className="wsp-amount-card">
            <div className="wsp-receive-label">
              <span />
              <strong>YOU&apos;LL RECEIVE</strong>
              <span />
            </div>

            <div className="wsp-receive-main">
              <div className="wsp-usdt-coin" aria-label="USDT">
                <span>₮</span>
              </div>

              <div className="wsp-receive-info">
                <div className="wsp-receive-amount">
                  <strong>{Number(data.receiveAmount || 0).toFixed(2)}</strong>
                  <span>{data.coin || 'USDT'}</span>
                </div>

                <div className="wsp-after-fee">
                  <i className="fa-solid fa-shield-halved" />
                  After fee deduction
                </div>
              </div>
            </div>

            <div className="wsp-summary">
              <div className="wsp-summary-row">
                <span>
                  <i className="fa-solid fa-coins" />
                  Withdrawal Amount
                </span>

                <strong>{Number(data.amount || 0).toFixed(2)} USDT</strong>
              </div>

              <div className="wsp-summary-row">
                <span>
                  <i className="fa-solid fa-percent" />
                  Withdrawal Fee (3%)
                </span>

                <strong className="wsp-fee">
                  -{Number(data.fee || 0).toFixed(2)} USDT
                </strong>
              </div>

              <div className="wsp-summary-row wsp-summary-total">
                <span>You&apos;ll Receive</span>

                <strong>
                  {Number(data.receiveAmount || 0).toFixed(2)} USDT
                </strong>
              </div>
            </div>
          </article>

          <article className="wsp-details-card">
            <DetailRow
              icon={isBinance ? 'fa-id-card' : 'fa-wallet'}
              tone="yellow"
              label={isBinance ? 'Binance ID' : 'Wallet Address'}
              value={
                isBinance
                  ? data.binanceId || 'Pending'
                  : maskValue(data.walletAddress)
              }
              copyValue={isBinance ? data.binanceId : data.walletAddress}
              copied={copiedField === 'destination'}
              onCopy={() =>
                copyText(
                  'destination',
                  isBinance ? data.binanceId : data.walletAddress
                )
              }
            />

            <DetailRow
              icon="fa-hashtag"
              tone="green"
              label="Transaction ID"
              value={maskValue(data.transactionId)}
              copyValue={data.transactionId}
              copied={copiedField === 'transaction'}
              onCopy={() =>
                copyText('transaction', data.transactionId)
              }
            />

            <DetailRow
              icon="fa-network-wired"
              tone="red"
              label="Network"
              value={data.networkLabel || data.network || 'Pending'}
            />

            <DetailRow
              icon="fa-calendar-days"
              tone="blue"
              label="Requested Time"
              value={data.requestedAt || 'Pending'}
            />

            <DetailRow
              icon="fa-clock"
              tone="orange"
              label="Estimated Completion "
              value={data.estimatedCompletion || ' Within 5 - 15 Minutes'}
              highlight
            />

            <div className="wsp-detail-row">
              <span className="wsp-detail-label">
                <span className="wsp-detail-icon yellow">
                  <i className="fa-solid fa-spinner" />
                </span>
                Status
              </span>

              <span className="wsp-status">
                {currentStatus !== 'Completed' && (
                  <span className="wsp-spinner wsp-spinner-sm" />
                )}
                {currentStatus === 'Completed' && (
                  <i className="fa-solid fa-circle-check" />
                )}
                {currentStatus}
              </span>
            </div>
          </article>
        </section>

        <section className="wsp-security">
          <div className="wsp-security-intro">
            <div className="wsp-security-shield">
              <i className="fa-solid fa-shield-halved" />
            </div>

            <div>
              <h3>
                Your funds are fully <span>protected</span>
              </h3>

              <p>
                All withdrawals are protected with encrypted processing,
                security verification and real-time monitoring.
              </p>
            </div>
          </div>

          <div className="wsp-security-features">
            <SecurityFeature
              icon="fa-shield-halved"
              title="Bank-Level"
              subtitle="Security"
            />
            <SecurityFeature
              icon="fa-lock"
              title="256-bit SSL"
              subtitle="Encryption"
            />
            <SecurityFeature
              icon="fa-layer-group"
              title="Multi-Layer"
              subtitle="Protection"
            />
            <SecurityFeature
              icon="fa-eye"
              title="24/7 Fraud"
              subtitle="Monitoring"
            />
          </div>
        </section>

        <section className="wsp-actions">
          <div className="wsp-notify">
            <span className="wsp-bell">
              <i className="fa-regular fa-bell" />
            </span>

            <div>
              <strong>Notify Me When Completed</strong>
              <small>You will be notified once completed</small>
            </div>

            <button
              type="button"
              className={`wsp-switch ${
                notifyWhenCompleted ? 'active' : ''
              }`}
              onClick={() =>
                setNotifyWhenCompleted((previous) => !previous)
              }
              aria-pressed={notifyWhenCompleted}
              aria-label="Toggle withdrawal completion notification"
            >
              <span />
            </button>
          </div>

          <div className="wsp-wait">
            {currentStatus === 'Completed' ? (
              <i className="fa-solid fa-circle-check wsp-complete-icon" />
            ) : (
              <span className="wsp-spinner" />
            )}

            <div>
              <strong>
                {currentStatus === 'Completed'
                  ? 'Withdrawal Completed'
                  : 'Please Wait...'}
              </strong>
              <small>
                {currentStatus === 'Completed'
                  ? 'Your request has been completed'
                  : 'You may safely close this window'}
              </small>
            </div>
          </div>
        </section>

        <footer className="wsp-footer">
          <i className="fa-solid fa-lock" />
          You will be notified once your withdrawal is successfully completed.
        </footer>
      </div>

      <style jsx>{`
        .wsp-details-card {
          padding: 5px 18px;
        }

        :global(.wsp-detail-row) {
          min-height: 59px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 9px 0;
          border-bottom: 1px solid #20293a;
        }

        :global(.wsp-detail-row:last-child) {
          border-bottom: none;
        }

        :global(.wsp-detail-label) {
          display: flex;
          align-items: center;
          gap: 11px;
          color: #d2d7e0;
          font-size: 13px;
          white-space: nowrap;
        }

        :global(.wsp-detail-icon) {
          width: 34px;
          height: 34px;
          min-width: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-size: 14px;
        }

        :global(.wsp-detail-icon.yellow) {
          color: #ffd86a;
          background: rgba(240, 179, 50, 0.13);
          border: 1px solid rgba(240, 179, 50, 0.12);
        }

        :global(.wsp-detail-icon.green) {
          color: #35df8d;
          background: rgba(35, 211, 123, 0.14);
        }

        :global(.wsp-detail-icon.red) {
          color: #ff526c;
          background: rgba(238, 44, 74, 0.14);
        }

        :global(.wsp-detail-icon.blue) {
          color: #52a5ff;
          background: rgba(39, 122, 230, 0.15);
        }

        :global(.wsp-detail-icon.orange) {
          color: #f0b332;
          background: rgba(240, 179, 50, 0.13);
        }

        :global(.wsp-detail-value) {
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          color: #f1f5f9;
          font-size: 13px;
          font-weight: 600;
          text-align: right;
          word-break: break-word;
        }

        :global(.wsp-detail-value.highlight) {
          color: #f0b332;
          font-weight: 800;
        }

        :global(.wsp-copy) {
          width: 31px;
          height: 31px;
          min-width: 31px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(240, 179, 50, 0.3);
          border-radius: 7px;
          background: rgba(240, 179, 50, 0.09);
          color: #ffd86a;
          cursor: pointer;
          transition: 0.2s ease;
        }

        :global(.wsp-copy:hover),
        :global(.wsp-copy.copied) {
          color: #151515;
          border-color: #ffd86a;
          background: #ffd86a;
        }

        @media (max-width: 600px) {
          :global(.wsp-detail-row) {
            align-items: flex-start;
            flex-direction: column;
            gap: 8px;
          }

          :global(.wsp-detail-value) {
            width: 100%;
            justify-content: space-between;
            text-align: left;
          }
        }
      `}</style>

      <style jsx>{`
        :global(.wsp-security-features) {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          align-items: stretch;
        }

        :global(.wsp-security-feature) {
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          flex-direction: column;
          gap: 3px;
          padding: 0 11px;
          text-align: center;
          border-left: 1px solid #273044;
        }

        :global(.wsp-security-feature:first-child) {
          border-left: none;
        }

        :global(.wsp-security-feature > span) {
          width: 43px;
          height: 43px;
          min-width: 43px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 7px;
          border: 1px solid rgba(240, 179, 50, 0.16);
          border-radius: 50%;
          background: rgba(240, 179, 50, 0.12);
          color: #ffd86a;
          font-size: 18px;
          line-height: 1;
        }

        :global(.wsp-security-feature > strong) {
          display: block;
          color: #f8fafc;
          font-size: 11px;
          font-weight: 700;
          line-height: 1.35;
          white-space: nowrap;
        }

        :global(.wsp-security-feature > small) {
          display: block;
          margin-top: 2px;
          color: #adb6c4;
          font-size: 10px;
          line-height: 1.35;
          white-space: nowrap;
        }

        @media (max-width: 700px) {
          :global(.wsp-security-features) {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            row-gap: 18px;
          }

          :global(.wsp-security-feature:nth-child(3)) {
            border-left: none;
          }
        }

        @media (max-width: 380px) {
          :global(.wsp-security-features) {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          :global(.wsp-security-feature) {
            border-left: none;
            padding: 8px 0;
          }
        }
      `}</style>

      <style jsx>{`
        .wsp-overlay {
          --primary: #f0b332;
          --primary-light: #ffd86a;
          --primary-dark: #b97800;
          --primary-rgb: 240, 179, 50;
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 22px;
          overflow-y: auto;
          background:
            radial-gradient(
              circle at 8% 15%,
              /* rgba(var(--primary-rgb), 0.1), */
              transparent 27%
            ),
            radial-gradient(
              circle at 92% 78%,
              rgba(var(--primary-rgb), 0.07),
              transparent 25%
            ),
            rgba(1, 4, 12, 0.9);
          backdrop-filter: blur(13px);
          animation: overlayIn 0.22s ease;
        }

        .wsp-modal {
          position: relative;
          width: min(1210px, 100%);
          max-height: calc(100vh - 34px);
          overflow-y: auto;
          padding: 34px;
          border: 1px solid rgba(240, 179, 50, 0.42);
          border-radius: 20px;
          background:
            radial-gradient(
              circle at 20% 8%,
              rgba(var(--primary-rgb), 0.07),
              transparent 28%
            ),
            linear-gradient(145deg, #080b13, #03060d);
          box-shadow:
            0 32px 100px rgba(0, 0, 0, 0.7),
            0 0 55px rgba(var(--primary-rgb), 0.08),
            inset 0 0 70px rgba(var(--primary-rgb), 0.025);
          color: #f8fafc;
          scrollbar-width: thin;
          scrollbar-color: var(--primary) #0a0e17;
          animation: modalIn 0.28s ease;
        }

        .wsp-modal::-webkit-scrollbar {
          width: 6px;
        }

        .wsp-modal::-webkit-scrollbar-track {
          background: #0a0e17;
        }

        .wsp-modal::-webkit-scrollbar-thumb {
          border-radius: 50px;
          background: var(--primary);
        }

        .wsp-close {
          position: absolute;
          top: 22px;
          right: 24px;
          z-index: 4;
          width: 46px;
          height: 46px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #343a48;
          border-radius: 50%;
          background: rgba(7, 10, 17, 0.88);
          color: #ffffff;
          font-size: 20px;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .wsp-close:hover {
          color: #151515;
          border-color: var(--primary);
          background: var(--primary);
          transform: rotate(90deg);
        }

        .wsp-header {
          display: grid;
          grid-template-columns: 290px 1fr;
          align-items: center;
          gap: 30px;
          padding-right: 60px;
        }

        .wsp-hero-art {
          position: relative;
          width: 250px;
          height: 215px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .wsp-orbit {
          position: absolute;
          border: 1px solid rgba(var(--primary-rgb), 0.28);
          border-radius: 50%;
        }

        .orbit-one {
          width: 215px;
          height: 145px;
          transform: rotate(-25deg);
        }

        .orbit-two {
          width: 195px;
          height: 195px;
          border-color: rgba(var(--primary-rgb), 0.18);
          box-shadow:
            0 0 28px rgba(var(--primary-rgb), 0.15),
            inset 0 0 25px rgba(var(--primary-rgb), 0.06);
        }

        .wsp-orbit-dot {
          position: absolute;
          z-index: 2;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--primary-light);
          box-shadow: 0 0 12px var(--primary);
        }

        .dot-one {
          top: 30px;
          left: 61px;
        }

        .dot-two {
          right: 34px;
          top: 94px;
        }

        .dot-three {
          bottom: 25px;
          left: 74px;
        }

        .wsp-wallet {
          position: relative;
          z-index: 2;
          width: 116px;
          height: 92px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(var(--primary-rgb), 0.48);
          border-radius: 24px;
          background:
            linear-gradient(
              145deg,
              rgba(var(--primary-rgb), 0.22),
              rgba(12, 17, 29, 0.98)
            );
          box-shadow:
            0 0 42px rgba(var(--primary-rgb), 0.24),
            inset 0 0 24px rgba(var(--primary-rgb), 0.07);
          color: var(--primary-light);
          font-size: 50px;
        }

        .wsp-hourglass {
          position: absolute;
          z-index: 3;
          right: 48px;
          bottom: 41px;
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid var(--primary);
          border-radius: 50%;
          background: #10141e;
          color: var(--primary-light);
          font-size: 21px;
          box-shadow: 0 0 22px rgba(var(--primary-rgb), 0.32);
        }

        .wsp-processing-badge {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          margin-bottom: 14px;
          border: 1px solid rgba(var(--primary-rgb), 0.28);
          border-radius: 999px;
          background: rgba(var(--primary-rgb), 0.1);
          color: var(--primary-light);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.55px;
        }

        .wsp-heading h2 {
          margin: 0;
          color: #ffffff;
          font-size: clamp(30px, 4vw, 48px);
          font-weight: 850;
          line-height: 1.1;
          letter-spacing: -1.5px;
        }

        .wsp-heading h2 span {
          color: var(--primary);
        }

        .wsp-heading p {
          margin: 12px 0 0;
          color: #aeb7c8;
          font-size: 16px;
        }

        .wsp-progress {
          position: relative;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          margin: 5px 12px 31px 300px;
        }

        .wsp-progress-track {
          position: absolute;
          top: 37px;
          left: 12.5%;
          right: 12.5%;
          height: 2px;
          overflow: hidden;
          background:
            repeating-linear-gradient(
              90deg,
              #4d5462 0,
              #4d5462 7px,
              transparent 7px,
              transparent 14px
            );
        }

        .wsp-progress-fill {
          position: absolute;
          inset: 0 auto 0 0;
          background: linear-gradient(
            90deg,
            var(--primary-dark),
            var(--primary-light)
          );
          box-shadow: 0 0 12px rgba(var(--primary-rgb), 0.85);
          transition: width 0.35s ease;
        }

        .wsp-step {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          flex-direction: column;
          text-align: center;
        }

        .wsp-step-icon {
          position: relative;
          width: 74px;
          height: 74px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          border: 2px solid #3c4351;
          border-radius: 50%;
          background: #0d121d;
          color: #d3d8e2;
          font-size: 26px;
          box-shadow: 0 0 0 7px #050811;
        }

        .wsp-step.done .wsp-step-icon {
          color: #151515;
          border-color: var(--primary);
          background: var(--primary);
        }

        .wsp-step.active .wsp-step-icon {
          color: #151515;
          border-color: var(--primary-light);
          background: linear-gradient(
            145deg,
            var(--primary-light),
            var(--primary-dark)
          );
          box-shadow:
            0 0 0 7px #050811,
            0 0 23px rgba(var(--primary-rgb), 0.75),
            inset 0 0 12px rgba(255, 255, 255, 0.25);
          animation: activeGlow 1.8s infinite;
        }

        .wsp-step-check {
          position: absolute;
          right: -3px;
          bottom: -3px;
          width: 25px;
          height: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid #050811;
          border-radius: 50%;
          background: #171717;
          color: var(--primary-light);
          font-size: 10px;
        }

        .wsp-step strong {
          color: #ffffff;
          font-size: 14px;
        }

        .wsp-step small {
          margin-top: 5px;
          color: #8d96a8;
          font-size: 12px;
        }

        .wsp-step.active small,
        .wsp-step.done small {
          color: var(--primary-light);
        }

        .wsp-content-grid {
          display: grid;
          grid-template-columns: 1.06fr 0.94fr;
          gap: 25px;
        }

        .wsp-amount-card,
        .wsp-details-card {
          border: 1px solid #283142;
          border-radius: 16px;
          background: rgba(6, 11, 21, 0.8);
        }

        .wsp-amount-card {
          position: relative;
          overflow: hidden;
          padding: 25px 22px 20px;
          border-color: rgba(var(--primary-rgb), 0.4);
          background:
            radial-gradient(
              circle at 18% 22%,
              rgba(var(--primary-rgb), 0.16),
              transparent 38%
            ),
            linear-gradient(
              145deg,
              rgba(8, 14, 27, 0.98),
              rgba(4, 8, 16, 0.98)
            );
        }

        .wsp-amount-card::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            115deg,
            transparent 25%,
            rgba(var(--primary-rgb), 0.06),
            transparent 58%
          );
        }

        .wsp-receive-label {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .wsp-receive-label span {
          width: 72px;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(var(--primary-rgb), 0.75)
          );
        }

        .wsp-receive-label span:last-child {
          transform: rotate(180deg);
        }

        .wsp-receive-label strong {
          padding: 7px 14px;
          border: 1px solid #293142;
          border-radius: 8px;
          background: #080d17;
          color: #e7eaf0;
          font-size: 11px;
          letter-spacing: 0.4px;
        }

        .wsp-receive-main {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 25px;
          padding: 27px 10px 20px;
        }

        .wsp-usdt-coin {
          position: relative;
          width: 112px;
          height: 112px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 5px solid var(--primary-light);
          border-radius: 50%;
          background: linear-gradient(
            145deg,
            var(--primary-light),
            var(--primary-dark)
          );
          box-shadow:
            0 0 31px rgba(var(--primary-rgb), 0.35),
            inset -12px -12px 22px rgba(101, 60, 0, 0.28),
            inset 10px 10px 18px rgba(255, 255, 255, 0.25);
        }

        .wsp-usdt-coin::after {
          content: '';
          position: absolute;
          bottom: -17px;
          width: 132px;
          height: 25px;
          border-radius: 50%;
          background: rgba(var(--primary-rgb), 0.26);
          filter: blur(11px);
        }

        .wsp-usdt-coin span {
          color: #171717;
          font-size: 61px;
          font-weight: 950;
          transform: rotate(-8deg);
          text-shadow: 0 3px 5px rgba(255, 255, 255, 0.18);
        }

        .wsp-receive-amount {
          display: flex;
          align-items: baseline;
          gap: 10px;
          white-space: nowrap;
        }

        .wsp-receive-amount strong {
          color: var(--primary-light);
          font-size: clamp(36px, 4vw, 56px);
          font-weight: 900;
          letter-spacing: -2px;
          text-shadow: 0 0 24px rgba(var(--primary-rgb), 0.25);
        }

        .wsp-receive-amount span {
          color: #ffffff;
          font-size: clamp(25px, 3vw, 40px);
          font-weight: 800;
        }

        .wsp-after-fee {
          width: fit-content;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 12px;
          margin-top: 14px;
          border: 1px solid rgba(var(--primary-rgb), 0.3);
          border-radius: 7px;
          background: rgba(var(--primary-rgb), 0.09);
          color: var(--primary-light);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .wsp-summary {
          position: relative;
          z-index: 2;
          padding: 14px 18px;
          border: 1px solid #1f2938;
          border-radius: 13px;
          background: rgba(8, 14, 25, 0.9);
        }

        .wsp-summary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 10px 0;
        }

        .wsp-summary-row span {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #b5bdca;
          font-size: 13px;
        }

        .wsp-summary-row span i {
          width: 16px;
          color: #8791a3;
        }

        .wsp-summary-row strong {
          color: #f8fafc;
          font-size: 13px;
        }

        .wsp-summary-row .wsp-fee {
          color: #ff536d;
        }

        .wsp-summary-total {
          margin-top: 5px;
          padding-top: 15px;
          border-top: 1px solid #334155;
        }

        .wsp-summary-total span {
          color: #ffffff;
          font-weight: 800;
        }

        .wsp-summary-total strong {
          color: var(--primary-light);
          font-size: 16px;
        }

        /* ===== Details card: fixed to always render as a two-sided
           row (icon+label on the left, value+copy on the right),
           at every breakpoint, with roomier chip icons. ===== */

        .wsp-details-card {
          padding: 6px 20px;
        }

        .wsp-detail-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 15px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .wsp-detail-row:last-child {
          border-bottom: none;
        }

        .wsp-detail-label {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          gap: 13px;
          color: #9aa3b5;
          font-size: 13.5px;
          font-weight: 600;
          white-space: nowrap;
        }

        .wsp-detail-icon {
          width: 40px;
          height: 40px;
          min-width: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          font-size: 15px;
        }

        .wsp-detail-icon.yellow {
          color: var(--primary-light);
          background: rgba(var(--primary-rgb), 0.13);
        }

        .wsp-detail-icon.green {
          color: #35df8d;
          background: rgba(35, 211, 123, 0.14);
        }

        .wsp-detail-icon.red {
          color: #ff526c;
          background: rgba(238, 44, 74, 0.14);
        }

        .wsp-detail-icon.blue {
          color: #52a5ff;
          background: rgba(39, 122, 230, 0.15);
        }

        .wsp-detail-icon.orange {
          color: #ffb22b;
          background: rgba(230, 159, 39, 0.14);
        }

        .wsp-detail-value {
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          color: #f1f5f9;
          font-size: 14px;
          font-weight: 700;
          text-align: right;
          word-break: break-word;
        }

        .wsp-detail-value.highlight {
          color: var(--primary-light);
          font-weight: 800;
        }

        .wsp-copy {
          width: 32px;
          height: 32px;
          min-width: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(var(--primary-rgb), 0.3);
          border-radius: 9px;
          background: rgba(var(--primary-rgb), 0.09);
          color: var(--primary-light);
          cursor: pointer;
          transition: 0.2s ease;
        }

        .wsp-copy:hover,
        .wsp-copy.copied {
          color: #161616;
          border-color: var(--primary-light);
          background: var(--primary-light);
        }

        .wsp-status {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 13px;
          border: 1px solid rgba(var(--primary-rgb), 0.28);
          border-radius: 8px;
          background: rgba(var(--primary-rgb), 0.1);
          color: var(--primary-light);
          font-size: 12px;
          font-weight: 800;
          text-transform: capitalize;
        }

        .wsp-spinner {
          width: 34px;
          height: 34px;
          display: inline-block;
          flex-shrink: 0;
          border: 4px solid rgba(255, 255, 255, 0.24);
          border-top-color: var(--primary-light);
          border-radius: 50%;
          animation: spin 0.85s linear infinite;
        }

        .wsp-spinner-sm {
          width: 13px;
          height: 13px;
          border-width: 2px;
          border-color: rgba(var(--primary-rgb), 0.28);
          border-top-color: var(--primary-light);
        }

        .wsp-security {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          align-items: center;
          gap: 20px;
          margin-top: 24px;
          padding: 18px 24px;
          border: 1px solid #293247;
          border-radius: 15px;
          background:
            linear-gradient(
              90deg,
              rgba(var(--primary-rgb), 0.06),
              rgba(5, 10, 19, 0.94)
            );
        }

        .wsp-security-intro {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .wsp-security-shield {
          width: 94px;
          height: 94px;
          min-width: 94px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-light);
          font-size: 57px;
          filter: drop-shadow(
            0 0 16px rgba(var(--primary-rgb), 0.5)
          );
        }

        .wsp-security-intro h3 {
          margin: 0 0 8px;
          color: #ffffff;
          font-size: 17px;
        }

        .wsp-security-intro h3 span {
          color: var(--primary-light);
        }

        .wsp-security-intro p {
          max-width: 430px;
          margin: 0;
          color: #9ba6b8;
          font-size: 12px;
          line-height: 1.65;
        }

        /* .wsp-security-features {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }

        .wsp-security-feature {
          display: flex;
          align-items: center;
          flex-direction: column;
          padding: 0 11px;
          text-align: center;
          border-left: 1px solid #273044;
        }

        .wsp-security-feature:first-child {
          border-left: none;
        }

        .wsp-security-feature span {
          width: 43px;
          height: 43px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
          border-radius: 50%;
          background: rgba(var(--primary-rgb), 0.12);
          color: var(--primary-light);
          font-size: 18px;
        }

        .wsp-security-feature strong {
          color: #f8fafc;
          font-size: 11px;
        }

        .wsp-security-feature small {
          margin-top: 3px;
          color: #adb6c4;
          font-size: 10px;
        } */

        .wsp-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-top: 17px;
        }

        .wsp-notify,
        .wsp-wait {
          min-height: 77px;
          display: flex;
          align-items: center;
          padding: 15px 20px;
          border: 1px solid #293246;
          border-radius: 13px;
        }

        .wsp-notify {
          gap: 15px;
          background: #080e19;
        }

        .wsp-bell {
          width: 47px;
          height: 47px;
          min-width: 47px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #323b4d;
          border-radius: 50%;
          background: #141b28;
          color: var(--primary-light);
          font-size: 20px;
        }

        .wsp-notify > div,
        .wsp-wait > div {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .wsp-notify strong,
        .wsp-wait strong {
          color: #ffffff;
          font-size: 14px;
        }

        .wsp-notify small,
        .wsp-wait small {
          margin-top: 4px;
          color: #929cad;
          font-size: 11px;
        }

        .wsp-switch {
          width: 55px;
          height: 30px;
          flex-shrink: 0;
          padding: 3px;
          border: none;
          border-radius: 999px;
          background: #2b3343;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .wsp-switch span {
          width: 24px;
          height: 24px;
          display: block;
          border-radius: 50%;
          background: #ffffff;
          transition: transform 0.2s ease;
        }

        .wsp-switch.active {
          background: linear-gradient(
            90deg,
            var(--primary-dark),
            var(--primary-light)
          );
        }

        .wsp-switch.active span {
          transform: translateX(25px);
        }

        .wsp-wait {
          gap: 18px;
          border-color: var(--primary);
          background:
            radial-gradient(
              circle at 75% 50%,
              rgba(var(--primary-rgb), 0.2),
              transparent 48%
            ),
            linear-gradient(
              90deg,
              rgba(113, 74, 0, 0.95),
              rgba(196, 132, 0, 0.92)
            );
          box-shadow: inset 0 0 30px rgba(255, 255, 255, 0.04);
        }

        .wsp-wait small {
          color: rgba(255, 255, 255, 0.78);
        }

        .wsp-complete-icon {
          color: #ffffff;
          font-size: 34px;
        }

        .wsp-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding-top: 16px;
          color: #9ba4b5;
          font-size: 12px;
          text-align: center;
        }

        .wsp-footer i {
          color: var(--primary);
        }

        @keyframes overlayIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes activeGlow {
          0%,
          100% {
            box-shadow:
              0 0 0 7px #050811,
              0 0 16px rgba(var(--primary-rgb), 0.58);
          }
          50% {
            box-shadow:
              0 0 0 7px #050811,
              0 0 30px rgba(var(--primary-rgb), 0.92);
          }
        }

        @media (max-width: 1050px) {
          .wsp-modal {
            padding: 28px;
          }

          .wsp-header {
            grid-template-columns: 220px 1fr;
          }

          .wsp-hero-art {
            width: 210px;
          }

          .wsp-progress {
            margin-left: 220px;
          }

          .wsp-security {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 820px) {
          .wsp-overlay {
            align-items: flex-start;
            padding: 12px;
          }

          .wsp-modal {
            max-height: none;
            padding: 24px 18px;
            border-radius: 15px;
          }

          .wsp-header {
            grid-template-columns: 1fr;
            gap: 5px;
            padding-right: 0;
            text-align: center;
          }

          .wsp-hero-art {
            width: 100%;
            height: 180px;
            margin: 0 auto;
          }

          .wsp-processing-badge {
            margin-inline: auto;
          }

          .wsp-progress {
            margin: 30px 0;
          }

          .wsp-content-grid,
          .wsp-actions {
            grid-template-columns: 1fr;
          }

          .wsp-receive-main {
            flex-direction: column;
            text-align: center;
          }

          .wsp-after-fee {
            margin-inline: auto;
          }
        }

        @media (max-width: 600px) {
          .wsp-close {
            top: 14px;
            right: 14px;
            width: 39px;
            height: 39px;
          }

          .wsp-heading h2 {
            font-size: 30px;
          }

          .wsp-heading p {
            font-size: 13px;
          }

          .wsp-progress {
            grid-template-columns: repeat(4, minmax(80px, 1fr));
            overflow-x: auto;
            padding-bottom: 9px;
          }

          .wsp-progress-track {
            left: 40px;
            right: auto;
            width: 280px;
          }

          .wsp-step {
            min-width: 80px;
          }

          .wsp-step-icon {
            width: 58px;
            height: 58px;
            font-size: 20px;
          }

          .wsp-step strong {
            font-size: 11px;
          }

          .wsp-step small {
            font-size: 9px;
          }

          .wsp-usdt-coin {
            width: 90px;
            height: 90px;
          }

          .wsp-usdt-coin span {
            font-size: 48px;
          }

          .wsp-receive-amount {
            justify-content: center;
          }

          .wsp-receive-amount strong {
            font-size: 38px;
          }

          .wsp-receive-amount span {
            font-size: 25px;
          }

          /* Details card stays a two-sided row (icon+label / value)
             instead of stacking into a column — that stacking is what
             was causing the squished, uncolored look. Just tighten it. */
          .wsp-details-card {
            padding: 4px 14px;
          }

          .wsp-detail-row {
            padding: 12px 0;
            gap: 10px;
          }

          .wsp-detail-icon {
            width: 32px;
            height: 32px;
            min-width: 32px;
            border-radius: 9px;
            font-size: 13px;
          }

          .wsp-detail-label {
            gap: 9px;
            font-size: 12px;
          }

          .wsp-detail-value {
            font-size: 12px;
            gap: 7px;
          }

          .wsp-copy {
            width: 27px;
            height: 27px;
            min-width: 27px;
          }

          .wsp-security {
            padding: 18px 14px;
          }

          .wsp-security-intro {
            align-items: flex-start;
          }

          .wsp-security-shield {
            width: 60px;
            height: 60px;
            min-width: 60px;
            font-size: 39px;
          }

          .wsp-security-features {
            grid-template-columns: repeat(2, 1fr);
            gap: 18px 0;
          }

          .wsp-security-feature:nth-child(3) {
            border-left: none;
          }

          .wsp-notify,
          .wsp-wait {
            padding: 13px;
          }
        }
      `}</style>
    </div>
  );
}

interface DetailRowProps {
  icon: string;
  tone: 'yellow' | 'green' | 'red' | 'blue' | 'orange';
  label: string;
  value: string;
  copyValue?: string;
  copied?: boolean;
  highlight?: boolean;
  onCopy?: () => void;
}

function DetailRow({
  icon,
  tone,
  label,
  value,
  copyValue,
  copied = false,
  highlight = false,
  onCopy,
}: DetailRowProps) {
  return (
    <div className="wsp-detail-row">
      <span className="wsp-detail-label">
        <span className={`wsp-detail-icon ${tone}`}>
          <i className={`fa-solid ${icon}`} />
        </span>
        {label}
      </span>

      <span
        className={`wsp-detail-value ${highlight ? 'highlight' : ''}`}
      >
        {value}

        {copyValue && onCopy && (
          <button
            type="button"
            className={`wsp-copy ${copied ? 'copied' : ''}`}
            onClick={onCopy}
            aria-label={`Copy ${label}`}
            title={copied ? 'Copied' : `Copy ${label}`}
          >
            <i
              className={`fa-${
                copied ? 'solid' : 'regular'
              } fa-${copied ? 'check' : 'copy'}`}
            />
          </button>
        )}
      </span>
    </div>
  );
}

function SecurityFeature({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="wsp-security-feature">
      <span>
        <i className={`fa-solid ${icon}`} />
      </span>
      <strong>{title}</strong>
      <small>{subtitle}</small>
    </div>
  );
}