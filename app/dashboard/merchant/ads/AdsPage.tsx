'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StepOne from '@/components/dashboard/ads/StepOne';
import StepTwo from '@/components/dashboard/ads/StepTwo';
import StepThree from '@/components/dashboard/ads/StepThree';
import { toast } from 'react-toastify';
import { createAd, updateAd, P2pAdPayload } from '@/app/api/p2padsapi';
import { GetCurrencyLimitApi } from '@/app/api/p2p';
import { getMerchantAccountData } from '@/app/api/merchant';
import apiClient from '@/utils/apiClient';
import MyAds from '../../p2p-profile/MyAds';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Conditions {
  registered: boolean;
  registerDays: number;
  holdingsBTC: boolean;
  holdingsAmount: number;
}

export interface FormData {
  type: 'buy' | 'sell';
  asset: string;
  withFlat: string;
  priceType: 'fixed' | 'floating';
  fixedPrice: number;
  totalAmount: string;
  orderLimitMin: number;
  orderLimitMax: number;
  paymentMethodId: number;
  paymentTimeLimit: string;
  terms: string[];
  remarks: string;
  autoReply: string;
  displayRegion: string;
  conditions: Conditions;
  status: boolean;
  ad_create_type: 'merchant' | 'local';
}

export type StepErrors = Record<string, string>;

interface AdsPageProps {
  /** Pass an existing ad id + data to enter edit mode */
  editId?: number;
  defaultValues?: Partial<FormData>;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateStep1(d: FormData): StepErrors {
  const e: StepErrors = {};
  if (!d.asset)                                       e.asset       = 'Asset is required.';
  if (!d.withFlat)                                    e.withFlat    = 'Fiat currency is required.';
  if (!d.priceType)                                   e.priceType   = 'Price type is required.';
  if (d.priceType === 'fixed' && d.fixedPrice <= 0)  e.fixedPrice  = 'Fixed price must be greater than 0.';
  return e;
}

function validateStep2(d: FormData): StepErrors {
  const e: StepErrors = {};
  if (!d.totalAmount || parseFloat(d.totalAmount) <= 0)
    e.totalAmount = 'Total amount must be greater than 0.';
  if (!d.orderLimitMin || d.orderLimitMin <= 0)
    e.orderLimitMin = 'Minimum order limit is required.';
  if (!d.orderLimitMax || d.orderLimitMax <= 0)
    e.orderLimitMax = 'Maximum order limit is required.';
  if (d.orderLimitMin > 0 && d.orderLimitMax > 0 && d.orderLimitMin >= d.orderLimitMax)
    e.orderLimitMax = 'Maximum must be greater than minimum.';
  if (!d.paymentMethodId)
    e.paymentMethodId = 'Please select a payment method.';
  if (!d.paymentTimeLimit)
    e.paymentTimeLimit = 'Payment time limit is required.';
  return e;
}

function validateStep3(d: FormData): StepErrors {
  const e: StepErrors = {};
  if (!d.displayRegion) e.displayRegion = 'Display region is required.';
  return e;
}

// ─── Map camelCase form → snake_case API payload ──────────────────────────────

function toPayload(d: FormData): P2pAdPayload {
  const adCreateType = d.ad_create_type ?? 'merchant';

  return {
    type:                 d.type,
    asset:                d.asset,
    with_fiat:            d.withFlat,
    price_type:           d.priceType,
    fixed_price:          d.fixedPrice,
    total_amount:         d.totalAmount,
    order_limit_min:      d.orderLimitMin,
    order_limit_max:      d.orderLimitMax,
    payment_method_id:    d.paymentMethodId,
    payment_time_limit:   d.paymentTimeLimit,
    terms:                d.terms,
    remarks:              d.remarks,
    auto_reply:           d.autoReply,
    display_region:       d.displayRegion,
    status:               d.status,
    ad_create_type:       adCreateType,
  };
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_FORM: FormData = {
  type: 'buy',
  asset: '',
  withFlat: '',
  priceType: 'fixed',
  fixedPrice: 0,
  totalAmount: '',
  orderLimitMin: 0,
  orderLimitMax: 0,
  paymentMethodId: 0,
  paymentTimeLimit: '',
  terms: [],
  remarks: '',
  autoReply: '',
  displayRegion: '',
  conditions: { registered: false, registerDays: 0, holdingsBTC: false, holdingsAmount: 0 },
  status: true,
  ad_create_type: 'merchant',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdsPage({ editId, defaultValues }: AdsPageProps) {
  const isEditMode = Boolean(editId);
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [errors,      setErrors]      = useState<StepErrors>({});
  const [submitting,  setSubmitting]  = useState(false);
  const [formData,    setFormData]    = useState<FormData>({ ...DEFAULT_FORM, ...defaultValues });
  const [createdAd, setCreatedAd] = useState(false);
  const [activeTier, setActiveTier] = useState<{ name: string; platform_charge_percent: number; bonus_percent: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getMerchantAccountData(), apiClient.get('/user/merchant-level-tiers')])
      .then(([account, tiersResponse]) => {
        if (cancelled) return;
        const tiers = tiersResponse.data?.data;
        const tier = Array.isArray(tiers) ? tiers.find((item: { id: string }) => item.id === account.merchant_level?.active_tier_id) : null;
        if (tier) setActiveTier({
          name: String(tier.name ?? 'Active tier'),
          platform_charge_percent: Number(tier.platform_charge_percent ?? 0),
          bonus_percent: Number(tier.bonus_percent ?? 0),
        });
      }).catch(() => { if (!cancelled) setActiveTier(null); });
    return () => { cancelled = true; };
  }, []);

  const handleFormChange = (data: Partial<FormData>) => {
    setFormData(prev => {
      if ((data.type && data.type !== prev.type) || (data.withFlat !== undefined && data.withFlat !== prev.withFlat)) {
        return { ...prev, ...data, totalAmount: '', orderLimitMin: 0, orderLimitMax: 0 };
      }
      if (data.fixedPrice !== undefined && data.fixedPrice > 0 && prev.fixedPrice > 0 &&
        data.fixedPrice !== prev.fixedPrice) {
        const factor = prev.fixedPrice / data.fixedPrice;
        return {
          ...prev,
          ...data,
          totalAmount: prev.type === 'buy' && prev.totalAmount ? String(Number(prev.totalAmount) * factor) : prev.totalAmount,
          orderLimitMin: prev.orderLimitMin ? prev.orderLimitMin * factor : 0,
          orderLimitMax: prev.orderLimitMax ? prev.orderLimitMax * factor : 0,
        };
      }
      return { ...prev, ...data };
    });
    // Clear errors for touched fields immediately
    setErrors(prev => {
      const next = { ...prev };
      Object.keys(data).forEach(k => delete next[k]);
      return next;
    });
  };

  const handleNext = async () => {
    const stepErrors = currentStep === 1 ? validateStep1(formData)
                     : currentStep === 2 ? validateStep2(formData)
                     : {};
    if (currentStep === 1 && Object.keys(stepErrors).length === 0) {
      try {
        const response = await GetCurrencyLimitApi({ currency: formData.withFlat, order_type: formData.type });
        const range = response?.data;
        if (!range || response?.error) {
          stepErrors.fixedPrice = 'The current price range is unavailable. Please try again.';
        } else if (formData.fixedPrice < Number(range.minimum_price) ||
          (range.maximum_price !== null && formData.fixedPrice > Number(range.maximum_price))) {
          stepErrors.fixedPrice = `Price must be within the current ${formData.withFlat} range (${Number(range.minimum_price).toFixed(2)}–${range.maximum_price === null ? 'unlimited' : Number(range.maximum_price).toFixed(2)}).`;
        }
      } catch {
        stepErrors.fixedPrice = 'Could not load the live price range. Please try again.';
      }
    }
    if (Object.keys(stepErrors).length) { setErrors(stepErrors); return; }
    setErrors({});
    setCurrentStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevious = () => {
    setErrors({});
    setCurrentStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({ ...DEFAULT_FORM });
    setErrors({});
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    const stepErrors = validateStep3(formData);
    if (Object.keys(stepErrors).length) { setErrors(stepErrors); return; }
    setErrors({});
    setSubmitting(true);

    try {
      const payload = toPayload(formData);
      if (isEditMode && editId) {
        await updateAd(editId, payload);
        toast.success('Ad updated successfully!');
        router.push('/dashboard/merchant/ads/');
      } else {
        await createAd(payload);
        resetForm();
        setCreatedAd(false);
        toast.success('Ad posted successfully!');
        router.push('/dashboard/merchant/ads/');
      }
    } catch (e: unknown) {
      const error = e as {
        response?: {
          data?: {
            errors?: Record<string, string[]>;
            message?: string;
          };
        };
        message?: string;
      };

      // Surface Laravel validation errors on the relevant step
      const laravelErrors: Record<string, string[]> = error?.response?.data?.errors ?? {};
      if (Object.keys(laravelErrors).length) {
        const flat: StepErrors = {};
        Object.entries(laravelErrors).forEach(([k, msgs]) => {
          // Convert snake_case key back to camelCase for matching
          const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
          flat[camel] = msgs[0];
        });
        setErrors(flat);
        toast.error('Please fix the highlighted errors.');
      } else {
        toast.error(error?.response?.data?.message ?? error?.message ?? 'Something went wrong.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...defaultValues,
      }));
    }
  }, [defaultValues]);

  useEffect(() => {
    if (isEditMode) {
      setCreatedAd(true);
    }
  }, [isEditMode]);

  const stepValidators = [validateStep1, validateStep2, validateStep3];
  const stepHasError = (step: number) =>
    Object.keys(stepValidators[step - 1](formData)).length > 0;

  const setAd = async () => {
    // const res = await fetchUserInfoAPI();

    // if (!res?.data) return;

    // if (res.data.wallet.security_amount_for_ads < 20) {
    //   toast.error("Your current security deposit is less than $20. Consider adding more to ensure your ads remain active.");
    //   return;
    // }

    resetForm();
    setCreatedAd(true);
  }

  return (
    <div className="p2pPage mt-5">
      {/* <P2PTopNav /> */}

      <div className="p-4 d-flex gap-3 justify-content-between">
        <button className='btn btn-black bg-black text-white' onClick={()=>{ resetForm(); setCreatedAd(false); }}> All Ads</button>
        <div className="d-flex gap-2">
          {/* <button className='btn btn-warning' onClick={()=>setisOpenDepositModel(true)}>Add Security Money</button> */}
          <button className='btn btn-warning' onClick={()=>setAd()}>Create Ads</button>
        </div>
      </div>

     {!createdAd && (
        <div className="wallet-main-wrapprr">
          <MyAds />
        </div>
     )}

      {createdAd && (
        <div className="container-lg p-3">
          <div className="form-wrapper">
            <h6 className="pb-4 fw-7">{isEditMode ? 'Edit Ad' : 'Post Normal Ad'}</h6>
            {activeTier && <div className="rounded border border-warning-subtle bg-dark text-light px-3 py-2 mb-3 small">
              <strong className="text-warning">{activeTier.name} tier</strong>
              <span className="ms-3">Platform charge: {activeTier.platform_charge_percent.toFixed(2)}%</span>
              <span className="ms-3">Bonus: {activeTier.bonus_percent.toFixed(2)}%</span>
              <div className="text-white-50 mt-1">These rates apply to each completed merchant order. Your ad price remains the price you set below.</div>
            </div>}

            {/* Step Indicators */}
            <div className="steps-header border-bottom-0 pb-0">
              <div className="steps-container">
                {[
                  { n: 1, label: 'Set Type & Price' },
                  { n: 2, label: 'Set Amount & Payment' },
                  { n: 3, label: 'Remarks & Response' },
                ].map(({ n, label }, idx) => (
                  <>
                    {idx > 0 && <div key={`line-${n}`} className="step-line" />}
                    <div key={n} className={`step-indicator ${currentStep >= n ? 'active' : ''}`}>
                      <div className="step-number">{n}</div>
                      <div className="step-label">{label}</div>
                    </div>
                  </>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="steps-content">
              {currentStep === 1 && (
                <StepOne formData={formData} onFormChange={handleFormChange} errors={errors} />
              )}
              {currentStep === 2 && (
                <StepTwo formData={formData} onFormChange={handleFormChange} errors={errors} />
              )}
              {currentStep === 3 && (
                <StepThree formData={formData} onFormChange={handleFormChange} errors={errors} />
              )}
            </div>

            {/* Navigation */}
            <div className="steps-footer">
              <button
                className="btn btn-outline-secondary"
                onClick={handlePrevious}
                disabled={currentStep === 1 || submitting}
                type="button"
              >
                Previous
              </button>
              <button
                className="btn btn-warning"
                onClick={currentStep === 3 ? handleSubmit : handleNext}
                disabled={submitting}
                type="button"
              >
                {currentStep === 3
                  ? submitting ? 'Saving...' : isEditMode ? 'Update' : 'Post'
                  : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
