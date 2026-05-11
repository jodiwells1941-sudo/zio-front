'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StepOne from '@/components/dashboard/ads/StepOne';
import StepTwo from '@/components/dashboard/ads/StepTwo';
import StepThree from '@/components/dashboard/ads/StepThree';
import P2PTopNav from '@/components/dashboard/p2p/P2PTopNav';
import { toast } from 'react-toastify';
import { createAd, updateAd, P2pAdPayload } from '@/app/api/p2padsapi';
import MyAds from '../p2p-profile/MyAds';
import AddSecurityMoneyModal from './AddSecurityMonyModal';
import { useAuth } from '@/hooks/useAuth';
import { fetchUserInfoAPI } from '@/app/api/auth';

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
  const [isOpenDepositModel, setisOpenDepositModel] = useState(false);
  const { user } = useAuth();

  const handleFormChange = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    // Clear errors for touched fields immediately
    setErrors(prev => {
      const next = { ...prev };
      Object.keys(data).forEach(k => delete next[k]);
      return next;
    });
  };

  const handleNext = () => {
    const stepErrors = currentStep === 1 ? validateStep1(formData)
                     : currentStep === 2 ? validateStep2(formData)
                     : {};
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
      } else {
        await createAd(payload);
        toast.success('Ad posted successfully!');
      }
      router.push('/dashboard/ads/');
    } catch (e: any) {
      // Surface Laravel validation errors on the relevant step
      const laravelErrors: Record<string, string[]> = e?.response?.data?.errors ?? {};
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
        toast.error(e?.response?.data?.message ?? e?.message ?? 'Something went wrong.');
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
    const res = await fetchUserInfoAPI();

    if (!res?.data) return;

    if (res.data.wallet.security_amount_for_ads < 20) {
      toast.error("Your current security deposit is less than $20. Consider adding more to ensure your ads remain active.");
      return;
    }

    setCreatedAd(true);
  }

  return (
    <div className="p2pPage mt-5">
      <P2PTopNav />

      <div className="p-4 d-flex gap-3 justify-content-between">
        <button className='btn btn-black bg-black text-white' onClick={()=>setCreatedAd(false)}> All Ads</button>
        <div className="d-flex gap-2">
          <button className='btn btn-warning' onClick={()=>setisOpenDepositModel(true)}>Add Security Money</button>
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

      {isOpenDepositModel && (
        <AddSecurityMoneyModal 
          walletBalance={user.wallet.amount}
          currentSecurityDeposit={user.wallet.security_amount_for_ads}
          onClose={() => setisOpenDepositModel(false)}
          onSuccess={(newDeposit) => {
            // update your local state / refetch wallet
          }}

        />
      )}

    </div>
  );
}