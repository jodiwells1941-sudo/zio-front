import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Swal from 'sweetalert2';
import { SubmitDepositWithdrawApi } from '@/app/api/wallet';

interface FormData {
  coin: string;
  network: string;
  depositAddress: string;
  binanceId: string;
}

interface FormErrors {
  amount?: string;
  coin?: string;
  network?: string;
  depositAddress?: string;
  binanceId?: string;
}


const EthereumIcon = () => (
  <svg viewBox="0 0 256 417" xmlns="http://www.w3.org/2000/svg">
    <polygon
      fill="#fff"
      points="127.9,0 125.1,9.5 125.1,279.1 127.9,281.9 255.8,206.3"
    />
    <polygon
      fill="#D1D5DB"
      points="127.9,0 0,206.3 127.9,281.9 127.9,154.1"
    />
    <polygon
      fill="#D1D5DB"
      points="127.9,306.1 126.3,308.1 126.3,406.3 127.9,411 255.9,230.6"
    />
    <polygon
      fill="#fff"
      points="127.9,411 127.9,306.1 0,230.6"
    />
    <polygon
      fill="#fff"
      points="127.9,281.9 255.8,206.3 127.9,154.1"
    />
    <polygon
      fill="#D1D5DB"
      points="0,206.3 127.9,281.9 127.9,154.1"
    />
  </svg>
);

const TronIcon = () => (
  <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <path
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="18"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M22 24L224 62L106 224L22 24Z"
    />
    <path
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="18"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M22 24L108 92L224 62"
    />
    <path
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="18"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M108 92L106 224"
    />
  </svg>
);

const NETWORK_OPTIONS = [
  {
    id: "TRC20",
    label: "TRX - Tron (TRC20)",
    icon: <TronIcon />,
    className: "trx",
  },
  {
    id: "ERC20",
    label: "ETH - Ethereum (ERC20)",
    icon: <EthereumIcon />,
    className: "eth",
  },
];

// ── payment methods — same shape/values as DepositLayout's PAYMENT_METHODS ──────
const PAYMENT_METHODS = [
  {
    id: "crypto",
    label: "Tether (USDT TRC20)",
    desc: "Processing Time: Instant – 15 Minutes",
    rools: "Transaction Limit: 10 – 200,000 USD",
    icon: "/images/payment/usdt-trc20.png",
  },
  {
    id: "binance",
    label: "Binance Pay Manual",
    desc: "Processing Time: Instant – 6 Hours",
    rools: "Transaction Limit: 10 – 200,000 USD",
    icon: "/images/payment/binance.png",
  },
  {
    id: "erc",
    label: "Tether (USDT ERC20)",
    desc: "Processing Time: Instant – 15 Minutes",
    rools: "Transaction Limit: 10 – 200,000 USD",
    icon: "/images/payment/usdt-erc20.png",
  },
] as const;

export default function WithdrawLayout({
  title,
  actionLabel,
  amountPreset,
  selectedPayment,
  setSelectedPayment,
  selectedAmount,
  setSelectedAmount,
}: {
  title: string;
  actionLabel: string;
  amountPreset: number[];
  selectedPayment: string;
  setSelectedPayment: (v: string) => void;
  selectedAmount: number;
  setSelectedAmount: (v: number) => void;
}) {
  const [submitDeposit, setSubmitDeposit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    coin: '',
    network: '',
    depositAddress: '',
    binanceId: '',
  });

  // ── is the "Binance Pay Manual" method selected? ─────────────────────────────
  const isBinanceMethod = selectedPayment === 'binance';

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // ── network options filtered by the selected payment method (same rule as
  //    DepositLayout: crypto/binance → TRC20, erc → ERC20) ─────────────────────
  const availableNetworks = NETWORK_OPTIONS.filter((n) =>
    selectedPayment === 'erc' ? n.id === 'ERC20' : n.id === 'TRC20'
  );

  // ── auto-select the network whenever the payment method changes ─────────────
  useEffect(() => {
    const defaultNetwork = selectedPayment === 'erc' ? 'ERC20' : 'TRC20';
    setFormData((prev) => (prev.network === defaultNetwork ? prev : { ...prev, network: defaultNetwork }));
    setErrors((prev) => ({ ...prev, network: undefined }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPayment]);

  // ── when switching to Binance, clear out the crypto-only fields + their errors
  //    so stale coin/network/address data never gets submitted with a Binance
  //    withdrawal ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isBinanceMethod) {
      setFormData((prev) =>
        prev.coin === '' && prev.depositAddress === ''
          ? prev
          : { ...prev, coin: '', depositAddress: '' }
      );
      setErrors((prev) => ({ ...prev, coin: undefined, network: undefined, depositAddress: undefined }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBinanceMethod]);

  const activeNetwork = NETWORK_OPTIONS.find((n) => n.id === formData.network) ?? NETWORK_OPTIONS[0];
  const activeNetworkLabel = formData.network === 'ERC20' ? 'ERC20 (Ethereum)' : 'TRC20 (Tron)';

  // ── Validation ───────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!selectedAmount || selectedAmount < 20) {
      newErrors.amount = 'Minimum withdrawal amount is 20 USD.';
    } else if (selectedAmount > 4000) {
      newErrors.amount = 'Maximum withdrawal amount is 4,000 USD.';
    }

    if (isBinanceMethod) {
      // Binance Pay Manual: only Amount + Binance ID are shown/required
      if (!formData.binanceId.trim()) {
        newErrors.binanceId = 'Please enter your Binance ID.';
      }
    } else {
      // Crypto (TRC20 / ERC20): Coin is always required, then either a
      // Binance ID OR a Network + Deposit Address must be provided
      if (!formData.coin) {
        newErrors.coin = 'Please select a coin.';
      }

      const hasBinance = formData.binanceId.trim() !== '';
      const hasWallet = formData.network.trim() !== '' && formData.depositAddress.trim() !== '';

      if (!hasBinance && !hasWallet) {
        if (!formData.network) newErrors.network = 'Select a network.';
        if (!formData.depositAddress.trim()) newErrors.depositAddress = 'Enter deposit address.';
        if (!formData.network && !formData.depositAddress.trim()) {
          newErrors.binanceId = 'Provide either a Binance ID or wallet address + network.';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;

    const confirm = await Swal.fire({
      title: 'Confirm Withdrawal',
      html: `
        <p style="color:#999999;font-size:14px;">You are about to withdraw <strong>${selectedAmount} USD</strong>.</p>
        <p style="color:#e74c3c;font-size:13px;">This action cannot be undone.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Withdraw!',
      cancelButtonText: 'Cancel',
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        type: 'withdraw',
        amount: selectedAmount,
        payment_method: selectedPayment,
      };

      if (isBinanceMethod) {
        payload.binance_id = formData.binanceId.trim();
      } else {
        payload.coin = formData.coin;
        if (formData.binanceId.trim()) {
          payload.binance_id = formData.binanceId.trim();
        }
        payload.network = formData.network;
        payload.wallet_address = formData.depositAddress;
      }

      const res = await SubmitDepositWithdrawApi(payload);

      await Swal.fire(
        'Withdrawal Submitted!',
        res?.message ?? 'Your withdrawal is being processed.',
        'success'
      );

      setSubmitDeposit(true);

    } catch (err: any) {
      const data = err?.response?.data;

      // Laravel field-level validation errors
      // Laravel returns snake_case keys; our form state is camelCase.
      const BACKEND_FIELD_MAP: Record<string, keyof FormErrors> = {
        amount: 'amount',
        coin: 'coin',
        network: 'network',
        wallet_address: 'depositAddress',
        binance_id: 'binanceId',
      };

      if (data?.errors) {
        const serverErrors: FormErrors = {};
        Object.entries(data.errors).forEach(([key, msgs]) => {
          const mappedKey = BACKEND_FIELD_MAP[key];
          if (!mappedKey) return; // ignore fields we don't render (e.g. trx_id, type)
          serverErrors[mappedKey] = Array.isArray(msgs)
            ? (msgs as string[])[0]
            : String(msgs);
        });
        setErrors(serverErrors);
        Swal.fire('Validation Error', data?.message ?? 'Please fix the errors.', 'error');
      } else {
        Swal.fire('Error', data?.message ?? 'Something went wrong. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const withdrawalCharge = selectedAmount * 0.03;
  const receiveAmount = selectedAmount - withdrawalCharge;

  return (
    <div className="wl-wrapper">

      {/* ── Withdraw form card ── */}
      <div className="">

        <div className="wl-form-grid mt-2 deposit-wrapper">
          <div className="wl-card wl-form-card bg-light-dark p-0">
            {/* ── Payment method selector (same design system as DepositLayout) ── */}
            <div className="wl-card wl-method-card bg-light-dark">
              <div className="wl-method-header">
                <div>
                  <label className="wl-label wl-method-title">
                    Select Payment Method
                    <span className="text-danger ms-1">*</span>
                  </label>

                  <p className="wl-method-description">
                    Choose your preferred withdrawal method
                  </p>
                </div>

                <span className="wl-method-secure">
                  <i className="fa-solid fa-shield-halved" />
                  Secure withdrawal
                </span>
              </div>

              <div className="mt-2">
                {PAYMENT_METHODS.map((method) => {
                  const isActive = selectedPayment === method.id;

                  return (
                    <div className="col-12" key={method.id}>
                      <button
                        type="button"
                        className={`wl-method-btn mt-3 ${isActive ? 'active' : ''}`}
                        disabled={loading}
                        onClick={() => setSelectedPayment(method.id)}
                        aria-pressed={isActive}
                      >
                        <span className="wl-method-icon">
                          <Image
                            src={method.icon}
                            alt={method.label}
                            width={36}
                            height={36}
                            className="wl-method-image"
                          />
                        </span>

                        <span className="wl-method-content">
                          <span className="wl-method-top">
                            <span className="wl-method-label">{method.label}</span>

                            {isActive && (
                              <span className="wl-method-selected">
                                <i className="fa-solid fa-check" />
                              </span>
                            )}
                          </span>

                          <span className="wl-method-info d-flex">
                            <small className="wl-method-sub">
                              <i className="fa-solid fa-bolt" />
                              {method.desc}
                            </small>

                            {method.rools && (
                              <small className="wl-method-sub">
                                <i className="fa-solid fa-chart-simple" />
                                {method.rools}
                              </small>
                            )}
                          </span>
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className='wl-card wl-form-card bg-light-dark'>
            <h2 className="wl-form-title">{title}</h2>

            {/* Amount */}
            <div>
              <label className="wl-label">
                1. Amount <small className="text-danger fs-4">*</small>
              </label>

              <div className="amount-input mb-2">
                <input
                  type="text"
                  value={String(selectedAmount)}
                  onChange={(e) => {
                    const v = Number(e.target.value.replace(/[^\d.]/g, ''));
                    if (!Number.isNaN(v)) {
                      setSelectedAmount(v);
                      setErrors((err) => ({ ...err, amount: undefined }));
                    }
                  }}
                />
                <span>USDT</span>
              </div>

              {selectedAmount > 0 && (
  <div className="withdraw-summary mt-3 mb-2 p-3 rounded-4 bg-light-white">
    <div className="d-flex align-items-center justify-content-between mb-3">
      <div className="d-flex align-items-center gap-2">
        <div className="summary-icon">
          <i className="fas fa-wallet"></i>
        </div>

        <div>
          <h6 className="mb-0 text-white fw-bold">
            Withdrawal Summary
          </h6>
          <small className="text-secondary">
            Review your withdrawal details
          </small>
        </div>
      </div>

      <span className="badge rounded-pill bg-info bg-opacity-10 text-info px-3 py-2">
        USDT
      </span>
    </div>

    <div className="summary-row d-flex justify-content-between align-items-center py-2">
      <div className="d-flex align-items-center gap-2">
        <i className="fas fa-coins text-secondary"></i>
        <span className="text-secondary">Withdrawal Amount</span>
      </div>

      <span className="fw-semibold text-white">
        {selectedAmount.toFixed(2)} USDT
      </span>
    </div>

    <div className="summary-row d-flex justify-content-between align-items-center py-2">
      <div className="d-flex align-items-center gap-2">
        <i className="fas fa-percent text-warning"></i>
        <span className="text-secondary">Withdrawal Fee</span>
        <span className="badge bg-warning bg-opacity-10 text-warning">
          3%
        </span>
      </div>

      <span className="fw-semibold text-danger">
        -{withdrawalCharge.toFixed(2)} USDT
      </span>
    </div>

    <div className="border-top border-secondary border-opacity-25 mt-2 pt-3">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <div className="text-white fw-bold">
            You'll Receive
          </div>

          <small className="text-secondary">
            Amount after fee deduction
          </small>
        </div>

        <div className="receive-amount text-end px-3 py-2 rounded-3">
          <small className="d-block text-success opacity-75">
            Final Amount
          </small>

          <span className="fs-5 fw-bold text-success">
            {receiveAmount.toFixed(2)} USDT
          </span>
        </div>
      </div>
    </div>
  </div>
)}

              {errors.amount && (
                <small className="text-danger d-block">{errors.amount}</small>
              )}

              {amountPreset?.length > 0 && (
                <div className="wl-amount-presets">
                  {amountPreset.map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`wl-preset-btn ${selectedAmount === n ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedAmount(n);
                        setErrors((e) => ({ ...e, amount: undefined }));
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}

              {errors.amount ? (
                <small className="wl-hint text-danger">{errors.amount}</small>
              ) : (
                <small className="wl-hint text-danger">Min: 20 USD &nbsp;•&nbsp; Max: 4,000 USD</small>
              )}
            </div>



            {isBinanceMethod ? (
              /* ── Binance Pay Manual: only Binance ID ── */
              <div className="wl-full-field">
                <label className="wl-label">
                  2. Binance ID <small className="text-danger fs-4">*</small>
                </label>
                <div className="amount-input mb-1">
                  <input
                    type="text"
                    placeholder="Enter Binance ID"
                    value={formData.binanceId}
                    onChange={(e) => handleChange('binanceId', e.target.value)}
                  />
                </div>
                {errors.binanceId && <small className="wl-hint text-danger">{errors.binanceId}</small>}
              </div>
            ) : (
              /* ── Crypto (TRC20 / ERC20): Coin + Network + Deposit Address ── */
              <>
                <label className="wl-label">
                  2. Select Coin <small className="text-danger fs-4">*</small>
                </label>
                <div className="wl-dropdown">
                  <span className="wl-coin-badge wl-coin-badge--usdt">T</span>
                  <select
                    value={formData.coin}
                    onChange={(e) => handleChange('coin', e.target.value)}
                    aria-label="Select coin"
                  >
                    <option value="">Select Coin</option>
                    <option value="USDT">USDT</option>
                  </select>
                  <i className="fa-solid fa-chevron-down wl-dropdown-caret" />
                </div>
                {errors.coin && <small className="wl-hint text-danger">{errors.coin}</small>}

                {/* Network — options depend on the selected payment method */}
                <div className="mt-3">
                  <label className="wl-label">
                    3. Select Network <small className="text-danger fs-4">*</small>
                  </label>
                  <div className="wl-dropdown">
                    <span className={`wl-coin-badge p-1 wl-coin-badge--${activeNetwork.className}`}>
                      {activeNetwork.icon}
                    </span>
                    <select
                      value={formData.network}
                      onChange={(e) => handleChange('network', e.target.value)}
                      aria-label="Select network"
                    >
                      {availableNetworks.map((n) => (
                        <option key={n.id} value={n.id}>{n.label}</option>
                      ))}
                    </select>
                    <i className="fa-solid fa-chevron-down wl-dropdown-caret" />
                  </div>
                  <small className="wl-hint text-warning">
                    Network is locked to {activeNetworkLabel} for this payment method.
                  </small>
                  {errors.network && <small className="wl-hint text-danger">{errors.network}</small>}
                </div>

                {/* Deposit Address */}
                <div>
                  <label className="wl-label mt-3">
                    4. Deposit Address <small className="text-danger fs-4">*</small>
                  </label>
                  <div className="amount-input mb-1">
                    <input
                      type="text"
                      placeholder="Enter wallet address"
                      value={formData.depositAddress}
                      onChange={(e) => handleChange('depositAddress', e.target.value)}
                    />
                  </div>
                  {errors.depositAddress && (
                    <small className="wl-hint text-danger">{errors.depositAddress}</small>
                  )}
                </div>

                {/* Binance ID — optional alternative to wallet address + network */}
                <div className="wl-full-field mt-3">
                  <label className="wl-label">5. Binance ID <small className="text-danger fs-4">*</small></label>
                  <div className="amount-input mb-1">
                    <input
                      type="text"
                      placeholder="Enter Binance ID"
                      value={formData.binanceId}
                      onChange={(e) => handleChange('binanceId', e.target.value)}
                    />
                  </div>
                  {errors.binanceId && <small className="wl-hint text-danger">{errors.binanceId}</small>}
                  <small className="wl-hint text-warning">
                    Provide either a Binance ID, or a wallet address + network above.
                  </small>
                </div>
              </>
            )}

            <div className="pt-4 mt-3">
              <button
                type="button"
                className="wl-cta w-100"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Processing…' : `${actionLabel} ${selectedAmount} USD`} <span aria-hidden>→</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
      .withdraw-summary {
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
        transition: all 0.25s ease;
      }

      .withdraw-summary:hover {
        border-color: rgba(255, 255, 255, 0.14);
        transform: translateY(-1px);
      }

      .summary-icon {
        width: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        color: #0dcaf0;
        background: rgba(13, 202, 240, 0.1);
        border: 1px solid rgba(13, 202, 240, 0.15);
      }

      .summary-row {
        border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
      }

      .receive-amount {
        min-width: 150px;
        background: rgba(25, 135, 84, 0.1);
        border: 1px solid rgba(25, 135, 84, 0.2);
      }

      @media (max-width: 480px) {
        .withdraw-summary {
          padding: 14px !important;
        }

        .summary-row {
          gap: 12px;
        }

        .summary-row span {
          font-size: 13px;
        }

        .receive-amount {
          min-width: auto;
          padding: 8px 10px !important;
        }

        .receive-amount .fs-5 {
          font-size: 16px !important;
        }
      }
        .wl-wrapper {
          display: flex;
          flex-direction: column;
          gap: 24px;
          color: #e9ecf3;
        }

        /* Cards */
        .wl-card { border: 1px solid #1f2433; border-radius: 14px; padding: 20px; }

        /* ── Balance card ─────────────────────────────────────────────────── */
        .wl-balance-card { padding: 18px 22px; }
        .wl-balance-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .wl-balance-label { color: #8d96ad; font-size: 13px; font-weight: 600; }
        .wl-balance-value { color: #f5f7fb; font-size: 16px; font-weight: 700; }

        /* ── Payment method selector (mirrors DepositLayout) ─────────────── */
        .wl-method-card {
          padding: 24px;
          border: 1px solid #252b3a;
          border-radius: 16px;
          background:
            radial-gradient(
              circle at top right,
              rgba(240, 179, 50, 0.06),
              transparent 32%
            ),
            #20242d;
        }

        .wl-method-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .wl-method-title {
          margin: 0;
          color: #f5f7fb;
          font-size: 19px;
          font-weight: 700;
          display: block;
        }

        .wl-method-description {
          margin: 5px 0 0;
          color: #7f899f;
          font-size: 13px;
        }

        .wl-method-secure {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 11px;
          border: 1px solid rgba(43, 208, 115, 0.22);
          border-radius: 999px;
          background: rgba(43, 208, 115, 0.07);
          color: #2bd073;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .wl-method-btn {
          position: relative;
          width: 100%;
          min-height: 104px;
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 16px;
          overflow: hidden;
          text-align: left;
          border: 1px solid #303747;
          border-radius: 14px;
          background: #1D1E24;
          color: inherit;
          cursor: pointer;
          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .wl-method-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 3px;
          height: 100%;
          background: transparent;
          transition: background 0.2s ease;
        }

        .wl-method-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          border-color: #495164;
          background: #1d232d;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
        }

        .wl-method-btn.active {
          border-color: #f0b332;
          background:
            linear-gradient(
              135deg,
              rgba(240, 179, 50, 0.09),
              rgba(240, 179, 50, 0.02)
            ),
            #1b2028;
          box-shadow:
            0 0 0 1px rgba(240, 179, 50, 0.08),
            0 12px 30px rgba(0, 0, 0, 0.18);
        }

        .wl-method-btn.active::before {
          background: #f0b332;
        }

        .wl-method-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .wl-method-icon {
          width: 56px;
          height: 56px;
          min-width: 56px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 1px solid #343b4b;
          border-radius: 14px;
          background: #f5f6f8;
        }

        .wl-method-btn.active .wl-method-icon {
          border-color: rgba(240, 179, 50, 0.45);
          box-shadow: 0 0 0 4px rgba(240, 179, 50, 0.07);
        }

        .wl-method-image {
          width: 36px;
          height: 36px;
          object-fit: contain;
        }

        .wl-method-content {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .wl-method-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .wl-method-label {
          color: #f5f7fb;
          font-size: 14px;
          font-weight: 700;
          line-height: 1.3;
        }

        .wl-method-selected {
          width: 22px;
          height: 22px;
          min-width: 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #f0b332;
          color: #151922;
          font-size: 10px;
        }

        .wl-method-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .wl-method-sub {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #8791a7;
          font-size: 11.5px;
          line-height: 1.4;
        }

        .wl-method-sub i {
          width: 13px;
          color: #f0b332;
          text-align: center;
        }

        /* ── Withdraw form card ───────────────────────────────────────────── */
        .wl-form-title {
          margin: 0;
          color: #f5f7fb;
          font-size: 18px;
          font-weight: 700;
        }

        .wl-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px 24px;
        }
        @media (max-width: 700px) {
          .wl-form-grid { grid-template-columns: 1fr; }
        }

        .wl-full-field { margin-top: 8px; }

        .wl-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #f2f4f8;
          margin-bottom: 8px;
        }

        .wl-hint {
          display: block;
          margin-top: 6px;
          font-size: 12px;
        }

        /* Amount presets */
        .wl-amount-presets {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 8px;
        }
        .wl-preset-btn {
          background: #1D1E24;
          border: 1px solid #262c40;
          color: #c8cee0;
          font-weight: 600;
          font-size: 13px;
          padding: 6px 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: all .15s ease;
        }
        .wl-preset-btn:hover { border-color: #3a4255; }
        .wl-preset-btn.active {
          background: linear-gradient(90deg, #9cecfe, #9cecfe);
          color: #222e48;
          border-color: transparent;
        }
        .wl-preset-btn:disabled { opacity: .5; cursor: not-allowed; }

        /* Dropdowns */
        .wl-dropdown {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #1D1E24;
          border: 1px solid #262c40;
          border-radius: 10px;
          padding: 0 14px;
          transition: border-color .15s ease;
        }
        .wl-dropdown:focus-within {
          border-color: #1fae5c;
          box-shadow: 0 0 0 1px rgba(31,174,92,.4);
        }
        .wl-dropdown select {
          flex: 1;
          appearance: none;
          -webkit-appearance: none;
          background: transparent;
          border: none;
          outline: none;
          color: #f2f4f8;
          font-weight: 600;
          font-size: 14px;
          padding: 12px 0;
          cursor: pointer;
        }
        .wl-dropdown select option { background: #161b29; color: #f2f4f8; }
        .wl-dropdown-caret { color: #7c8499; font-size: 11px; pointer-events: none; }

        .wl-coin-badge {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
        }
        .wl-coin-badge--usdt { background: #1fae5c; }
        .wl-coin-badge--trx  { background: #e2393c; }
        .wl-coin-badge--eth  { background: #627eea; }
        .wl-coin-badge :global(svg) { width: 14px; height: 14px; }

        /* CTA */
        .wl-cta {
          width: 100%;
          border: none;
          border-radius: 50px;
          padding: 14px 18px;
          font-weight: 700;
          font-size: 15px;
          color: #222E48;
          background: linear-gradient(90deg, #9CECFE, #9CECFE);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: opacity .15s ease;
        }
        .wl-cta:disabled { opacity: .5; cursor: not-allowed; }

        @media (max-width: 767px) {
          .wl-method-card, .wl-form-card { padding: 18px; }
          .wl-method-header { flex-direction: column; }
          .wl-method-btn { min-height: unset; padding: 14px; }
          .wl-method-icon { width: 50px; height: 50px; min-width: 50px; }
          .wl-method-image { width: 32px; height: 32px; }
        }

        @media (max-width: 420px) {
          .wl-method-secure { display: none; }
          .wl-method-btn { gap: 12px; }
          .wl-method-label { font-size: 13px; }
          .wl-method-sub { font-size: 10.5px; }
        }
      `}</style>
    </div>
  );
}