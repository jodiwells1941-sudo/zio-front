import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Swal from 'sweetalert2';
import { SubmitDepositWithdrawApi, getWithdrawChargeApi } from '@/app/api/wallet';
import WithdrawSubmitProcessingModel from './WithdrawSubmitProcessingModel';

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

interface WithdrawalModalData {
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

  // ── withdraw charge (fetched from API instead of hardcoded 3%) ──────────────
  const [withdrawChargePercent, setWithdrawChargePercent] = useState<number>(3); // fallback until API resolves
  const [isChargeLoading, setIsChargeLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchWithdrawCharge = async () => {
      try {
        const res = await getWithdrawChargeApi();
        if (!res.error) {
          setWithdrawChargePercent(Number(res.data?.withdraw_charge ?? 3));
        } else {
          console.error('Failed to fetch withdraw charge:', res.message);
        }
      } catch (error) {
        console.error('Error fetching withdraw charge:', error);
      } finally {
        setIsChargeLoading(false);
      }
    };

    fetchWithdrawCharge();
  }, []);

  // \\── is the "Binance Pay Manual" method selected? ─────────────────────────────
  const isBinanceMethod = selectedPayment === 'binance';

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // \\── network options filtered by the selected payment method (same rule as
  //    DepositLayout: crypto/binance → TRC20, erc → ERC20) ─────────────────────
  const availableNetworks = NETWORK_OPTIONS.filter((n) =>
    selectedPayment === 'erc' ? n.id === 'ERC20' : n.id === 'TRC20'
  );

  // ── reset network to empty whenever the payment method changes, so the
  //    "Select Network" placeholder is shown first and the user must
  //    explicitly choose a network (icon only appears after that choice) ─────
  useEffect(() => {
    setFormData((prev) => (prev.network === '' ? prev : { ...prev, network: '' }));
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

  // ── Does this submission actually use a wallet address as the destination,
  //    or a Binance ID? `formData.network` is no longer auto-filled, so the
  //    real signal is whether a deposit address was typed in, and we're
  //    not on the Binance payment method. This single flag drives the
  //    confirmation summary, the icon, and the submitted payload so they all
  //    agree with what the user actually entered. ─────────────────────────────
  const usesWalletDestination = !isBinanceMethod && formData.depositAddress.trim() !== '';

  // ── derived fee/receive amount — now based on the fetched charge percent ────
  const withdrawalCharge = selectedAmount * (withdrawChargePercent / 100);
  const receiveAmount = selectedAmount - withdrawalCharge;

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
      // Crypto (TRC20 / ERC20): Coin + Network are always required, then
      // either a Binance ID OR a Deposit Address must be provided.
      if (!formData.coin) {
        newErrors.coin = 'Please select a coin.';
      }

      if (!formData.network) {
        newErrors.network = 'Please select a network.';
      }

      const hasBinance = formData.binanceId.trim() !== '';
      const hasWallet = formData.depositAddress.trim() !== '';

      if (!hasBinance && !hasWallet) {
        newErrors.depositAddress = 'Enter deposit address.';
        newErrors.binanceId = 'Provide either a Binance ID or a wallet address.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;

    const selectedMethodLabel =
      PAYMENT_METHODS.find((item) => item.id === selectedPayment)?.label ??
      selectedPayment;

    const maskAddress = (value: string) => {
      if (!value) return 'Not provided';
      if (value.length <= 18) return value;

      return `${value.slice(0, 8)}...${value.slice(-8)}`;
    };

    // ── destination label/value now reflect what was actually filled in,
    //    not just which payment method is selected ──────────────────────────
    const destinationLabel = usesWalletDestination ? 'Wallet Address' : 'Binance ID';

    const destinationValue = usesWalletDestination
      ? maskAddress(formData.depositAddress.trim())
      : (formData.binanceId.trim() || 'Not provided');

    const confirm = await Swal.fire({
      width: 460,
      background: '#080c14',
      color: '#ffffff',
      showCancelButton: true,
      showCloseButton: true,
      buttonsStyling: false,
      focusConfirm: false,
      reverseButtons: true,
      allowOutsideClick: false,
      allowEscapeKey: true,

      customClass: {
        container: 'withdraw-confirm-container',
        popup: 'withdraw-confirm-popup',
        closeButton: 'withdraw-confirm-close',
        htmlContainer: 'withdraw-confirm-content',
        actions: 'withdraw-confirm-actions',
        confirmButton: 'withdraw-confirm-btn confirm',
        cancelButton: 'withdraw-confirm-btn cancel',
      },

      html: `
        <div class="withdraw-confirm-heading">
          <span class="withdraw-confirm-icon">
            <i class="fa-solid fa-wallet"></i>
          </span>

          <div class="withdraw-confirm-heading-copy">
            <h3>Confirm Withdrawal</h3>
            <p>Review the details before submitting.</p>
          </div>
        </div>

        <div class="withdraw-confirm-amount">
          <small>YOU'LL RECEIVE</small>

          <div class="withdraw-confirm-amount-value">
            <strong>${receiveAmount.toFixed(2)}</strong>
            <span>USDT</span>
          </div>

          <p>After ${withdrawChargePercent}% withdrawal fee</p>
        </div>

        <div class="withdraw-confirm-details">
          <div class="withdraw-confirm-row">
            <span>
              <i class="fa-solid fa-coins"></i>
              Amount
            </span>
            <strong>${selectedAmount.toFixed(2)} USDT</strong>
          </div>

          <div class="withdraw-confirm-row">
            <span>
              <i class="fa-solid fa-percent"></i>
              Fee (${withdrawChargePercent}%)
            </span>
            <strong class="fee-value">
              -${withdrawalCharge.toFixed(2)} USDT
            </strong>
          </div>

          <div class="withdraw-confirm-row">
            <span>
              <i class="fa-solid fa-credit-card"></i>
              Method
            </span>
            <strong>${selectedMethodLabel}</strong>
          </div>

          ${
            usesWalletDestination
              ? `
                <div class="withdraw-confirm-row">
                  <span>
                    <i class="fa-solid fa-network-wired"></i>
                    Network
                  </span>
                  <strong>${activeNetworkLabel}</strong>
                </div>
              `
              : ''
          }

          <div class="withdraw-confirm-row">
            <span>
              <i class="fa-solid ${
                usesWalletDestination ? 'fa-wallet' : 'fa-id-card'
              }"></i>
              ${destinationLabel}
            </span>
            <strong class="destination-value" title="${destinationValue}">
              ${destinationValue}
            </strong>
          </div>
        </div>

        <div class="withdraw-confirm-warning">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <span>
            Double-check the destination. A submitted withdrawal may not be reversible.
          </span>
        </div>
      `,

      confirmButtonText: `
        <i class="fa-solid fa-check"></i>
        Confirm Withdrawal
      `,

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

        // Only send wallet/network when the user actually filled in a
        // deposit address — otherwise they're withdrawing via Binance ID
        // even though a crypto payment method is selected.
        if (usesWalletDestination) {
          payload.network = formData.network;
          payload.wallet_address = formData.depositAddress.trim();
        }

        if (formData.binanceId.trim()) {
          payload.binance_id = formData.binanceId.trim();
        }
      }

      const res = await SubmitDepositWithdrawApi(payload);

      const responseData =
        res?.data?.data ??
        res?.data ??
        res ??
        {};

      const responseMessage =
        res?.data?.message ??
        res?.message ??
        'Your withdrawal request is being processed securely.';

      const responseFee = Number(
        responseData?.withdrawal_fee ??
        responseData?.fee ??
        withdrawalCharge
      );

      const responseReceiveAmount = Number(
        responseData?.receive_amount ??
        responseData?.amount_after_fee ??
        receiveAmount
      );

      setWithdrawalModalData({
        message: responseMessage,

        amount: Number(
          responseData?.amount ??
          selectedAmount
        ),

        fee: responseFee,

        receiveAmount: responseReceiveAmount,

        paymentMethod:
          responseData?.payment_method ??
          selectedPayment,

        coin:
          responseData?.coin ??
          'USDT',

        network:
          responseData?.network ??
          formData.network ??
          '',

        networkLabel:
          responseData?.network_label ??
          (
            usesWalletDestination
              ? activeNetworkLabel
              : 'Binance Pay Manual'
          ),

        walletAddress:
          responseData?.wallet_address ??
          responseData?.crypto_address ??
          formData.depositAddress ??
          '',

        binanceId:
          responseData?.binance_id ??
          formData.binanceId ??
          '',

        transactionId:
          responseData?.transaction_id ??
          responseData?.trx_id ??
          responseData?.withdrawal_id ??
          responseData?.deposit_id ??
          '',

        requestedAt: formatDateTime(
          responseData?.requested_at ??
          responseData?.created_at
        ),

        estimatedCompletion:
          responseData?.estimated_completion ??
          (
            usesWalletDestination
              ? 'Within 5 - 15 Minutes'
              : 'Within 1 - 6 Hours'
          ),

        status:
          responseData?.status_text ??
          responseData?.status_label ??
          'Processing',
      });

      setShowProcessingModal(true);
      setSubmitDeposit(true);
    } catch (err: any) {
      const data = err?.response?.data;

      const BACKEND_FIELD_MAP: Record<string, keyof FormErrors> = {
        amount: 'amount',
        coin: 'coin',
        network: 'network',
        wallet_address: 'depositAddress',
        binance_id: 'binanceId',
      };

      if (data?.errors) {
        const serverErrors: FormErrors = {};

        Object.entries(data.errors).forEach(([key, messages]) => {
          const mappedKey = BACKEND_FIELD_MAP[key];

          if (!mappedKey) return;

          serverErrors[mappedKey] = Array.isArray(messages)
            ? String(messages[0])
            : String(messages);
        });

        setErrors(serverErrors);

        await Swal.fire({
          title: 'Validation Error',
          text: data?.message ?? 'Please review the form information.',
          icon: 'error',
          background: '#080c14',
          color: '#ffffff',
          confirmButtonColor: '#f0b332',
        });
      } else {
        await Swal.fire({
          title: 'Withdrawal Failed',
          text:
            data?.message ??
            err?.message ??
            'Something went wrong. Please try again.',
          icon: 'error',
          background: '#080c14',
          color: '#ffffff',
          confirmButtonColor: '#f0b332',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [withdrawalModalData, setWithdrawalModalData] =
    useState<WithdrawalModalData | null>(null);


  const formatDateTime = (value?: string | null) => {
    if (!value) {
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(new Date());
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };



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

          {/* check paymentmethod is selected  */}
          {selectedPayment != '' && (
            <div className='wl-card wl-form-card bg-light-dark'>
              <h2 className="wl-form-title">{title}</h2>

              {/* Amount */}
              <div>
                <label className="wl-label">
                  1. Amount <small className="text-danger fs-4">*</small>
                </label>

                <div className="amount-input mb-1">
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

                {errors.amount && (
                  <small className="text-danger d-block">{errors.amount}</small>
                )}

                {/* {amountPreset?.length > 0 && (
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
                )} */}

                {errors.amount ? (
                  <small className="wl-hint text-danger">{errors.amount}</small>
                ) : (
                  <small className="wl-hint text-danger">Min: 20 USD &nbsp;•&nbsp; Max: 4,000 USD</small>
                )}
              </div>

              {selectedAmount > 0 && (
                <div className="d-flex justify-content-between w-full">
                    <div className='text-warning'>
                      Fees {withdrawalCharge.toFixed(2)} USDT
                      {!isChargeLoading && ` (${withdrawChargePercent}%)`}
                    </div>
                    <div style={{ fontWeight: 600, color: 'green', fontSize: '18px' }}>
                      You will receive {receiveAmount.toFixed(2)} USDT
                    </div>
                </div>
              )}
              <div className="w-full border-bottom border-dark-light pt-2 mb-3"></div>

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
                    { formData.coin === 'USDT' &&
                      <span className="wl-coin-badge wl-coin-badge--usdt">T</span>
                    }
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

                  {/* Network — options depend on the selected payment method.
                      Starts unselected ("Select Network"); the icon badge only
                      appears once the user actually picks a network. */}
                  <div className="mt-3">
                    <label className="wl-label">
                      3. Select Network <small className="text-danger fs-4">*</small>
                    </label>
                    <div className="wl-dropdown">
                      {formData.network !== '' && formData.network === activeNetwork.id && (
                        <span className={`wl-coin-badge p-1 wl-coin-badge--${activeNetwork.className}`}>
                          {activeNetwork.icon}
                        </span>
                      )}

                      <select
                        value={formData.network}
                        onChange={(e) => handleChange('network', e.target.value)}
                        aria-label="Select network"
                      >
                        <option value="">Select Network</option>
                        {availableNetworks.map((n) => (
                          <option key={n.id} value={n.id}>{n.label}</option>
                        ))}
                      </select>
                      <i className="fa-solid fa-chevron-down wl-dropdown-caret" />
                    </div>
                    <small className="wl-hint text-warning">
                      Only {availableNetworks[0]?.label ?? activeNetworkLabel} is available for this payment method.
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
                  disabled={loading || isChargeLoading}
                >
                  {isChargeLoading
                    ? 'Loading…'
                    : loading
                    ? 'Processing…'
                    : `${actionLabel} ${selectedAmount} USD`} <span aria-hidden>→</span>
                </button>
              </div>
            </div>
          )}

          {/* If no payment method is selected, show a placeholder message */}
          {selectedPayment === "" && (
            <div
              className="wl-card wl-form-card bg-light-dark rounded-4 p-5 text-center position-relative overflow-hidden"
              style={{
                background:
                  "radial-gradient(circle at top, rgba(240,179,50,.08), transparent 70%), #0b0f17",
              }}
            >
              {/* Glow */}
              <div
                className="position-absolute top-0 start-50 translate-middle rounded-circle"
                style={{
                  width: "180px",
                  height: "180px",
                  background: "rgba(240,179,50,.08)",
                  filter: "blur(60px)",
                  pointerEvents: "none",
                }}
              />

              {/* Icon */}
              <div
                className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: "80px",
                  height: "80px",
                  background: "rgba(240,179,50,.12)",
                  border: "2px solid rgba(240,179,50,.35)",
                  color: "#f0b332",
                  fontSize: "34px",
                }}
              >
                <i className="fa-solid fa-wallet"></i>
              </div>

              <h5 className="fw-bold text-white mb-2">
                Select a Payment Method
              </h5>

              <p
                className="text-secondary mx-auto mb-0"
                style={{ maxWidth: "420px", lineHeight: 1.7 }}
              >
                Please choose your preferred payment method to continue your withdrawal
                request.
              </p>

              <div
                className="d-inline-flex align-items-center gap-2 mt-4 px-3 py-2 rounded-pill"
                style={{
                  background: "rgba(240,179,50,.12)",
                  color: "#f0b332",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                <i className="fa-solid fa-circle-info"></i>
                Choose Binance or Crypto Wallet
              </div>
            </div>
          )}

        </div>
      </div>

      {withdrawalModalData && (
        <WithdrawSubmitProcessingModel
          open={showProcessingModal}
          data={withdrawalModalData}
          onClose={() => {
            setShowProcessingModal(false);
            setSubmitDeposit(false);
          }}
        />
      )}

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

      <style jsx global>{`
        .swal2-container.withdraw-confirm-container {
          z-index: 999999 !important;
          padding: 16px !important;
          background: rgba(2, 5, 12, 0.82) !important;
          backdrop-filter: blur(9px);
        }

        .withdraw-confirm-popup {
          width: min(460px, calc(100vw - 24px)) !important;
          height: auto !important;
          min-height: 0 !important;
          max-height: calc(100vh - 32px) !important;
          display: block !important;
          grid-template-columns: none !important;
          grid-template-rows: none !important;
          align-content: initial !important;
          justify-content: initial !important;
          padding: 0 !important;
          margin: 0 !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
          border: 1px solid rgba(240, 179, 50, 0.38) !important;
          border-radius: 17px !important;
          background:
            radial-gradient(
              circle at top right,
              rgba(240, 179, 50, 0.1),
              transparent 38%
            ),
            linear-gradient(145deg, #0b1019, #050810) !important;
          box-shadow:
            0 28px 80px rgba(0, 0, 0, 0.72),
            0 0 34px rgba(240, 179, 50, 0.08) !important;
        }

        .withdraw-confirm-popup,
        .withdraw-confirm-popup * {
          box-sizing: border-box;
        }

        .withdraw-confirm-popup > * {
          grid-column: auto !important;
          grid-row: auto !important;
        }

        .withdraw-confirm-popup .swal2-title,
        .withdraw-confirm-popup .swal2-icon,
        .withdraw-confirm-popup .swal2-footer {
          display: none !important;
        }

        .withdraw-confirm-close {
          position: absolute !important;
          top: 12px !important;
          right: 12px !important;
          z-index: 5 !important;
          width: 32px !important;
          height: 32px !important;
          margin: 0 !important;
          padding: 0 !important;
          border: 1px solid #30394b !important;
          border-radius: 9px !important;
          background: rgba(17, 23, 34, 0.95) !important;
          color: #9ca6b6 !important;
          font-size: 22px !important;
          line-height: 30px !important;
          transition: 0.18s ease !important;
        }

        .withdraw-confirm-close:hover {
          border-color: rgba(240, 179, 50, 0.5) !important;
          background: rgba(240, 179, 50, 0.1) !important;
          color: #f0b332 !important;
        }

        .withdraw-confirm-content {
          width: 100% !important;
          display: block !important;
          margin: 0 !important;
          padding: 20px 20px 0 !important;
          color: #ffffff !important;
          overflow: visible !important;
          text-align: left !important;
        }

        .withdraw-confirm-heading {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 10px;
          padding-right: 0;
          margin: 0 0 14px;
        }

        .withdraw-confirm-icon {
          width: 43px;
          height: 43px;
          min-width: 43px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(240, 179, 50, 0.38);
          border-radius: 12px;
          background: rgba(240, 179, 50, 0.1);
          color: #f0b332;
          font-size: 18px;
        }

        .withdraw-confirm-heading-copy {
          min-width: 0;
          text-align: center;
        }

        .withdraw-confirm-heading h3 {
          margin: 0;
          color: #ffffff;
          font-size: 19px;
          font-weight: 800;
          line-height: 1.25;
        }

        .withdraw-confirm-heading p {
          margin: 3px 0 0;
          color: #8f99aa;
          font-size: 11px;
          font-weight: 500;
          line-height: 1.4;
        }

        .withdraw-confirm-amount {
          width: 100%;
          padding: 14px;
          margin: 0 0 12px;
          border: 1px solid rgba(240, 179, 50, 0.28);
          border-radius: 12px;
          background:
            radial-gradient(
              circle at center,
              rgba(240, 179, 50, 0.1),
              transparent 72%
            ),
            #090e18;
          text-align: center;
        }

        .withdraw-confirm-amount small {
          display: block;
          margin-bottom: 5px;
          color: #a9b1bf;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.7px;
        }

        .withdraw-confirm-amount-value {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 6px;
        }

        .withdraw-confirm-amount-value strong {
          color: #ffd86a;
          font-size: 31px;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.8px;
        }

        .withdraw-confirm-amount-value span {
          color: #ffffff;
          font-size: 16px;
          font-weight: 800;
        }

        .withdraw-confirm-amount p {
          margin: 6px 0 0;
          color: #f0b332;
          font-size: 9.5px;
          font-weight: 700;
        }

        .withdraw-confirm-details {
          width: 100%;
          padding: 3px 13px;
          overflow: hidden;
          border: 1px solid #222b3c;
          border-radius: 12px;
          background: rgba(7, 12, 22, 0.9);
        }

        .withdraw-confirm-row {
          width: 100%;
          min-height: 41px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 7px 0;
          border-bottom: 1px solid #20293a;
        }

        .withdraw-confirm-row:last-child {
          border-bottom: none;
        }

        .withdraw-confirm-row > span {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #aeb7c6;
          font-size: 11px;
          line-height: 1.4;
          text-align: left;
          white-space: nowrap;
        }

        .withdraw-confirm-row > span i {
          width: 14px;
          min-width: 14px;
          color: #f0b332;
          text-align: center;
        }

        .withdraw-confirm-row > strong {
          min-width: 0;
          max-width: 60%;
          color: #f8fafc;
          font-size: 11px;
          font-weight: 700;
          line-height: 1.4;
          text-align: right;
          overflow-wrap: anywhere;
        }

        .withdraw-confirm-row .fee-value {
          color: #ff536d;
        }

        .withdraw-confirm-row .destination-value {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .withdraw-confirm-warning {
          width: 100%;
          display: flex;
          align-items: flex-start;
          gap: 9px;
          padding: 10px 11px;
          margin: 11px 0 0;
          border: 1px solid rgba(240, 179, 50, 0.2);
          border-radius: 10px;
          background: rgba(240, 179, 50, 0.065);
          color: #aab3c2;
          font-size: 10px;
          line-height: 1.5;
          text-align: left;
        }

        .withdraw-confirm-warning i {
          margin-top: 2px;
          color: #f0b332;
          font-size: 13px;
        }

        .withdraw-confirm-actions {
          width: 100% !important;
          display: grid !important;
          grid-template-columns: 0.85fr 1.15fr !important;
          gap: 9px !important;
          padding: 15px 20px 19px !important;
          margin: 0 !important;
        }

        .withdraw-confirm-btn {
          width: 100% !important;
          min-height: 41px;
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 9px 13px !important;
          margin: 0 !important;
          border-radius: 9px !important;
          font-family: inherit !important;
          font-size: 11.5px !important;
          font-weight: 800 !important;
          line-height: 1 !important;
          cursor: pointer;
          transition:
            transform 0.18s ease,
            border-color 0.18s ease,
            background 0.18s ease,
            box-shadow 0.18s ease;
        }

        .withdraw-confirm-btn.confirm {
          border: 1px solid #f0b332 !important;
          background: linear-gradient(90deg, #eaaa20, #ffd86a) !important;
          color: #161616 !important;
          box-shadow: 0 7px 20px rgba(240, 179, 50, 0.18);
        }

        .withdraw-confirm-btn.confirm:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(240, 179, 50, 0.26);
        }

        .withdraw-confirm-btn.cancel {
          border: 1px solid #30394b !important;
          background: #111722 !important;
          color: #c8cfda !important;
        }

        .withdraw-confirm-btn.cancel:hover {
          color: #ffffff !important;
          border-color: #526079 !important;
          background: #18202e !important;
        }

        @media (max-width: 480px) {
          .withdraw-confirm-content {
            padding: 17px 16px 0 !important;
          }

          .withdraw-confirm-heading {
            gap: 10px;
            margin-bottom: 12px;
          }

          .withdraw-confirm-icon {
            width: 40px;
            height: 40px;
            min-width: 40px;
            font-size: 16px;
          }

          .withdraw-confirm-heading h3 {
            font-size: 17px;
          }

          .withdraw-confirm-amount {
            padding: 12px 9px;
          }

          .withdraw-confirm-amount-value strong {
            font-size: 27px;
          }

          .withdraw-confirm-amount-value span {
            font-size: 14px;
          }

          .withdraw-confirm-row {
            min-height: 38px;
            gap: 9px;
          }

          .withdraw-confirm-row > span,
          .withdraw-confirm-row > strong {
            font-size: 10px;
          }

          .withdraw-confirm-row > strong {
            max-width: 56%;
          }

          .withdraw-confirm-actions {
            padding: 13px 16px 16px !important;
          }
        }

        @media (max-width: 360px) {
          .withdraw-confirm-row {
            align-items: flex-start;
            flex-direction: column;
            gap: 3px;
            padding: 8px 0;
          }

          .withdraw-confirm-row > strong {
            width: 100%;
            max-width: 100%;
            text-align: left;
          }

          .withdraw-confirm-row .destination-value {
            white-space: normal;
          }

          .withdraw-confirm-actions {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}