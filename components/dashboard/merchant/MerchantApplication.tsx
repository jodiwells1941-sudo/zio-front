"use client";

import React, {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import ReactSelect from "react-select";
import countryList from "react-select-country-list";
import {
  allCountries,
  type CountryTelephoneData,
} from "country-telephone-data";
import { toast } from "react-toastify";
import { submitMerchantApplicationApi, getMerchantDepositAmountApi } from "@/app/api/merchant";
import { walletSettingsDataApi } from "@/app/api/auth";
import { useRouter } from "next/navigation";

/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "merchant_application";

type PersistedApplication = {
  step: number;
  data: ApplicationData;
  depositPaid: boolean;
  agreed: boolean;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="field-error" role="alert" aria-live="polite">
      <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 5 }} />
      {message}
    </p>
  );
}

type Option = { label: string; value: string };

type Step = 1 | 2 | 3 | 4 | 5;

type FieldErrors = Record<string, string>;

type ApplicationData = {
  // Step 1
  fullName: string;
  username: string;
  email: string;
  phoneCountryCode: string;
  phone: string;
  country: string;
  address: string;

  // Step 2
  businessType: string;
  businessName: string;
  taxId: string;
  businessEmail: string;
  businessPhoneCountryCode: string;
  businessPhone: string;
  operationType: string;

  // Trading
  tradeCoin: string;
  paymentMethods: string[];
};

interface Wallet {
  amount?: number;
  real_amount?: number;
  bonus_amount?: number;
  pending_withdrawal?: number;
  // Add other wallet properties as needed
}

interface WalletSettings {
  wallet?: Wallet;
}

const TOTAL_STEPS = 5;
const DEFAULT_DEPOSIT_AMOUNT = 500;

const STEPS = [
  "Basic Information",
  "Business Information",
  "Documents",
  "Security Deposit",
  "Review & Submit",
];

const initialData: ApplicationData = {
  fullName: "",
  username: "",
  email: "",
  phoneCountryCode: "+880",
  phone: "",
  country: "Bangladesh",
  address: "",

  businessType: "Individual",
  businessName: "",
  taxId: "",
  businessEmail: "",
  businessPhoneCountryCode: "+880",
  businessPhone: "",
  operationType: "Manually (I will manage orders)",

  tradeCoin: "USDT",
  paymentMethods: [],
};

/* =========================================================
   PER-STEP VALIDATION
   Each validator returns which fields failed (keyed by the
   same field name used in ApplicationData / Documents) so the
   UI can show inline errors as well as a toast + banner.
========================================================= */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateStepOne(data: ApplicationData): FieldErrors {
  const errors: FieldErrors = {};

  if (!data.fullName.trim()) errors.fullName = "Full name is required.";
  if (!data.username.trim()) errors.username = "Username is required.";

  if (!data.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!data.phone.trim()) errors.phone = "Phone number is required.";
  if (!data.country.trim()) errors.country = "Country is required.";
  if (!data.address.trim()) errors.address = "Address is required.";

  return errors;
}

function validateStepTwo(data: ApplicationData): FieldErrors {
  const errors: FieldErrors = {};

  if (!data.businessType.trim()) errors.businessType = "Business type is required.";
  if (!data.taxId.trim()) errors.taxId = "Tax ID / NID number is required.";

  if (!data.businessEmail.trim()) {
    errors.businessEmail = "Business email is required.";
  } else if (!EMAIL_REGEX.test(data.businessEmail)) {
    errors.businessEmail = "Enter a valid business email address.";
  }

  if (!data.businessPhone.trim()) errors.businessPhone = "Business phone is required.";
  if (!data.operationType.trim()) errors.operationType = "Please select how you'll operate your ads.";
  if (!data.tradeCoin.trim()) errors.tradeCoin = "Preferred trade coin is required.";

  if (data.paymentMethods.length === 0) {
    errors.paymentMethods = "Select at least one payment method.";
  }

  return errors;
}

function validateStepThree(): FieldErrors {
  // Step 3 is now a static, informational preview of the documents
  // our team reviews — there's nothing for the user to submit here.
  return {};
}

function validateStepFour(depositPaid: boolean): FieldErrors {
  const errors: FieldErrors = {};

  if (!depositPaid) {
    errors.deposit = "Please complete the security deposit before continuing.";
  }

  return errors;
}

function validateStepFive(agreed: boolean): FieldErrors {
  const errors: FieldErrors = {};

  if (!agreed) {
    errors.agreed = "Please confirm that all information is accurate.";
  }

  return errors;
}

function validateStep(
  step: Step,
  data: ApplicationData,
  depositPaid: boolean,
  agreed: boolean
): FieldErrors {
  switch (step) {
    case 1:
      return validateStepOne(data);
    case 2:
      return validateStepTwo(data);
    case 3:
      return validateStepThree();
    case 4:
      return validateStepFour(depositPaid);
    case 5:
      return validateStepFive(agreed);
    default:
      return {};
  }
}

const GENERIC_STEP_MESSAGES: Record<Step, string> = {
  1: "Please complete all required basic information.",
  2: "Please complete all required business information.",
  3: "Please upload all required documents.",
  4: "Please complete the security deposit before continuing.",
  5: "Please confirm that all information is accurate.",
};

export default function MerchantApplication() {
  const [step, setStep] = useState<Step>(1);

  const [data, setData] =
    useState<ApplicationData>(initialData);

  const [depositPaid, setDepositPaid] =
    useState(false);

  const [depositTime, setDepositTime] =
    useState(30 * 60);

  const [agreed, setAgreed] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [fieldErrors, setFieldErrors] =
    useState<FieldErrors>({});

  const [restored, setRestored] =
    useState(false);

  /*
   * -------------------------------------------------------
   * WALLET BALANCE + REQUIRED DEPOSIT AMOUNT
   * -------------------------------------------------------
   * Pulls the merchant's current wallet balance and the
   * required security deposit amount so Step 4 can decide
   * whether a manual deposit is actually needed.
   */

  const [walletSettings, setWalletSettings] =
    useState<WalletSettings | null>(null);

  const [requiredDepositAmount, setRequiredDepositAmount] =
    useState<number>(DEFAULT_DEPOSIT_AMOUNT);

  const [depositInfoLoading, setDepositInfoLoading] =
    useState(true);

  const walletAmount = walletSettings?.wallet?.amount ?? 0;

  useEffect(() => {
    const fetchDepositInfo = async () => {
      setDepositInfoLoading(true);

      try {
        const [walletRes, depositRes] = await Promise.all([
          walletSettingsDataApi(),
          getMerchantDepositAmountApi(),
        ]);

        setWalletSettings(walletRes?.data ?? null);        
        const amount = Number(depositRes?.data?.deposit_amount);

        setRequiredDepositAmount(
          Number.isFinite(amount) && amount > 0
            ? amount
            : DEFAULT_DEPOSIT_AMOUNT
        );
      } catch {
        // Fall back to the default deposit amount and no known
        // wallet balance — the manual deposit flow still works.
        setRequiredDepositAmount(DEFAULT_DEPOSIT_AMOUNT);
      } finally {
        setDepositInfoLoading(false);
      }
    };

    fetchDepositInfo();
  }, []);

  const hasSufficientBalance =
    !depositInfoLoading && walletAmount >= requiredDepositAmount;

  // If the merchant's existing wallet balance already covers the
  // required deposit, treat the deposit requirement as satisfied
  // automatically so they can continue the application.
  useEffect(() => {
    if (hasSufficientBalance && !depositPaid) {
      setDepositPaid(true);
    }
  }, [hasSufficientBalance, depositPaid]);

  /*
   * -------------------------------------------------------
   * RESTORE APPLICATION (runs once on mount)
   * -------------------------------------------------------
   * Restores whatever step the user last completed along with
   * every field they had already filled in. Uploaded files
   * themselves can't survive localStorage, so Step 3 always
   * asks the user to re-attach documents if they land back on it.
   */

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed: Partial<PersistedApplication> = JSON.parse(saved);

        let hasSavedProgress = false;

        if (parsed.data) {
          setData((prev) => ({
            ...prev,
            ...parsed.data,
          }));
          hasSavedProgress = true;
        }

        setDepositPaid(Boolean(parsed.depositPaid));
        setAgreed(Boolean(parsed.agreed));

        if (
          typeof parsed.step === "number" &&
          parsed.step >= 1 &&
          parsed.step <= TOTAL_STEPS
        ) {
          setStep(parsed.step as Step);
          hasSavedProgress = true;
        }

        if (hasSavedProgress) {
          toast("Restored your previous progress.");
        }
      }
    } catch {
      // Ignore invalid local storage
    } finally {
      setRestored(true);
    }
  }, []);

  /*
   * -------------------------------------------------------
   * SAVE APPLICATION
   * -------------------------------------------------------
   * Persists after the very first restore pass so a stale
   * empty state can't overwrite a save we haven't loaded yet.
   */

  useEffect(() => {
    if (!restored) return;

    try {
      const payload: PersistedApplication = {
        step,
        data,
        depositPaid,
        agreed,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage errors
    }
  }, [restored, step, data, depositPaid, agreed]);

  /*
   * -------------------------------------------------------
   * DEPOSIT COUNTDOWN
   * -------------------------------------------------------
   */

  useEffect(() => {
    if (step !== 4 || depositPaid) {
      return;
    }

    if (depositTime <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setDepositTime((previous) =>
        previous > 0 ? previous - 1 : 0
      );
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [step, depositPaid, depositTime]);

  /*
   * -------------------------------------------------------
   * HELPERS
   * -------------------------------------------------------
   */

  const updateData = (
    field: keyof ApplicationData,
    value: string | string[]
  ) => {
    setData((previous) => ({
      ...previous,
      [field]: value,
    }));

    // Clear that field's error the moment the user starts fixing it.
    setFieldErrors((previous) => {
      if (!previous[field as string]) return previous;
      const next = { ...previous };
      delete next[field as string];
      return next;
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(remaining).padStart(2, "0")}`;
  };

  const completedStep = Math.max(
    step - 1,
    0
  );

  /*
   * -------------------------------------------------------
   * VALIDATION
   * -------------------------------------------------------
   * Validates a single step, updates the inline field errors,
   * the top banner message, and fires a toast on failure.
   */

  const runStepValidation = (targetStep: Step): boolean => {
    const errors = validateStep(
      targetStep,
      data,
      depositPaid,
      agreed
    );

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const message = GENERIC_STEP_MESSAGES[targetStep];
      setError(message);
      toast.error(message);
      return false;
    }

    setError("");
    return true;
  };

  /*
   * -------------------------------------------------------
   * VALIDATE EVERY STEP AT ONCE
   * -------------------------------------------------------
   * Used right before final submission so we never send a
   * payload built from data that hasn't actually passed
   * validation (e.g. if the user edited an earlier step via
   * "Edit" on the review screen and left something blank).
   */

  const runFullValidation = (): { valid: boolean; failedStep?: Step; errors: FieldErrors } => {
    const allSteps: Step[] = [1, 2, 3, 4, 5];

    for (const candidate of allSteps) {
      const errors = validateStep(
        candidate,
        data,
        depositPaid,
        agreed
      );

      if (Object.keys(errors).length > 0) {
        return { valid: false, failedStep: candidate, errors };
      }
    }

    return { valid: true, errors: {} };
  };

  /*
   * -------------------------------------------------------
   * NEXT STEP
   * -------------------------------------------------------
   */

  const handleNext = () => {
    if (!runStepValidation(step)) {
      return;
    }

    // Data for the completed step is already in `data` (and will be
    // written to localStorage by the persistence effect above), so
    // simply advancing the step is enough to "save & continue".
    if (step < TOTAL_STEPS) {
      setStep((previous) =>
        (previous + 1) as Step
      );
    }
  };

  /*
   * -------------------------------------------------------
   * PREVIOUS
   * -------------------------------------------------------
   */

  const handlePrevious = () => {
    setError("");
    setFieldErrors({});

    if (step > 1) {
      setStep((previous) =>
        (previous - 1) as Step
      );
    }
  };

  /*
   * -------------------------------------------------------
   * PAYMENT METHOD
   * -------------------------------------------------------
   */

  const togglePaymentMethod = (
    method: string
  ) => {
    setData((previous) => {
      const exists =
        previous.paymentMethods.includes(
          method
        );

      return {
        ...previous,
        paymentMethods: exists
          ? previous.paymentMethods.filter(
              (item) => item !== method
            )
          : [
              ...previous.paymentMethods,
              method,
            ],
      };
    });

    setFieldErrors((previous) => {
      if (!previous.paymentMethods) return previous;
      const next = { ...previous };
      delete next.paymentMethods;
      return next;
    });
  };

  /*
   * -------------------------------------------------------
   * FINAL SUBMIT
   * -------------------------------------------------------
   */

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    // Re-validate every step, not just Step 5 — the combined
    // payload we're about to send draws on data collected across
    // the whole flow, so all of it needs to be valid together.
    const fullResult = runFullValidation();

    if (!fullResult.valid) {
      setFieldErrors(fullResult.errors);

      const message = fullResult.failedStep
        ? GENERIC_STEP_MESSAGES[fullResult.failedStep]
        : "Please review your application before submitting.";

      setError(message);
      toast.error(message);

      if (fullResult.failedStep) {
        setStep(fullResult.failedStep);
      }

      return;
    }

    setLoading(true);
    setError("");

    try {
      // `data` already carries every field collected across Steps
      // 1 & 2, so building the payload here naturally combines
      // everything saved from previous steps with the final state.
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        formData.append(
          key,
          Array.isArray(value) ? JSON.stringify(value) : value
        );
      });

      formData.append("deposit_paid", depositPaid ? "1" : "0");
      formData.append("agreed_terms", agreed ? "1" : "0");

      await submitMerchantApplicationApi(formData);

      // Only clear the saved draft once the API has actually
      // accepted it — if the request fails below, the catch block
      // deliberately leaves localStorage untouched.
      localStorage.removeItem(STORAGE_KEY);

      toast.success("Application submitted successfully!");
      setSubmitted(true);
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.message ||
        (err?.response?.data?.errors &&
          // cast errors to a record so numeric indexing is allowed
          (Object.values(err.response.data.errors as Record<string, any>) as any)[0]?.[0]);

      const message =
        apiMessage ||
        "Unable to submit your application. Please try again.";

      // Intentionally NOT clearing localStorage here — the user's
      // progress stays saved so a failed request doesn't cost them
      // their entered information.
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  /*
   * -------------------------------------------------------
   * SUCCESS
   * -------------------------------------------------------
   */

  if (submitted) {
    return (
      <div className="merchant-success-page">

        <div className="merchant-success-card">

          <div className="success-check">
            <i className="fa-solid fa-check" />
          </div>

          <h1>
            Application Submitted
          </h1>

          <p>
            Your merchant application has been
            submitted successfully.
          </p>

          <span>
            Our team will review your application
            and notify you within 24 hours.
          </span>

          <button
            type="button"
            onClick={() =>
              window.location.href =
                "/dashboard/merchant"
            }
            className="merchant-purple-btn"
          >
            Go to Merchant Center
            <i className="fa-solid fa-arrow-right" />
          </button>

        </div>

      </div>
    );
  }

  return (
    <section className="merchant-application">

      {/* ===================================================
          HEADER
      ==================================================== */}

      <div className="application-top">

        <div className="application-heading">

          <div>
            <h1>
              Merchant Application
              {step === 5 && (
                <i className="fa-solid fa-circle-check verified-title" />
              )}
            </h1>

            <p>
              {step === 1 &&
                "Apply now and start your journey as a verified merchant on LuckySpin."}

              {step === 2 &&
                "Tell us about your business and how you plan to trade on LuckySpin."}

              {step === 3 &&
                "Just a few more steps! Here's a preview of the documents our team reviews for verification."}

              {step === 4 &&
                "A security deposit helps us maintain a safe and trusted P2P marketplace."}

              {step === 5 &&
                "Review all your information and submit your application."}
            </p>
          </div>

          <button
            type="button"
            className="application-guide-btn"
          >
            <span className="guide-info-icon">
              <i className="fa-solid fa-info" />
            </span>

            <span>
              <strong>
                Application Guide
              </strong>

              <small>
                Read requirements &amp; tips
              </small>
            </span>

            <i className="fa-solid fa-chevron-right" />
          </button>

        </div>

      </div>

      {/* ===================================================
          PROGRESS
      ==================================================== */}

      <ApplicationProgress
        current={step}
        onChange={(newStep) => {
          if (
            newStep < step ||
            newStep <= completedStep
          ) {
            setError("");
            setFieldErrors({});
            setStep(newStep as Step);
          }
        }}
      />

      {/* ===================================================
          ERROR
      ==================================================== */}

      {error && (
        <div className="application-error">
          <i className="fa-solid fa-circle-exclamation" />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      )}

      {/* ===================================================
          STEP CONTENT
      ==================================================== */}

      <form
        onSubmit={handleSubmit}
        className="application-form"
      >

        {step === 1 && (
          <StepOne
            data={data}
            updateData={updateData}
            fieldErrors={fieldErrors}
          />
        )}

        {step === 2 && (
          <StepTwo
            data={data}
            updateData={updateData}
            togglePaymentMethod={
              togglePaymentMethod
            }
            fieldErrors={fieldErrors}
          />
        )}

        {step === 3 && <StepThree />}

        {step === 4 && (
          <StepFour
            depositPaid={depositPaid}
            depositTime={depositTime}
            formatTime={formatTime}
            requiredDepositAmount={requiredDepositAmount}
            walletAmount={walletAmount}
            hasSufficientBalance={hasSufficientBalance}
            depositInfoLoading={depositInfoLoading}
          />
        )}

        {step === 5 && (
          <StepFive
            data={data}
            depositPaid={depositPaid}
            agreed={agreed}
            setAgreed={(value) => {
              setAgreed(value);
              setFieldErrors((previous) => {
                if (!previous.agreed) return previous;
                const next = { ...previous };
                delete next.agreed;
                return next;
              });
            }}
            agreedError={fieldErrors.agreed}
            onEdit={(targetStep) => {
              setError("");
              setFieldErrors({});
              setStep(targetStep);
            }}
          />
        )}

        {/* =================================================
            FOOTER ACTIONS
        ================================================== */}

        <div className="application-footer pt-5">

          <button
            type="button"
            className="application-prev-btn"
            onClick={handlePrevious}
            disabled={step === 1}
          >
            <i className="fa-solid fa-arrow-left" />

            Previous Step
          </button>

          <div className="application-step-counter">

            <strong>
              Step {step} of 5
            </strong>

            <div className="mini-progress">
              {STEPS.map(
                (_, index) => (
                  <span
                    key={index}
                    className={
                      index + 1 <= step
                        ? "active"
                        : ""
                    }
                  />
                )
              )}
            </div>

          </div>

          {step < 4 && (
            <button
              type="button"
              className="application-next-btn"
              onClick={handleNext}
            >
              Save &amp; Continue

              <i className="fa-solid fa-arrow-right" />
            </button>
          )}

          {step === 4 && (
            <button
              type="button"
              className="application-next-btn"
              onClick={handleNext}
              disabled={!depositPaid}
            >
              {hasSufficientBalance ? "Continue" : "I Have Deposited"}

              <i className="fa-solid fa-arrow-right" />
            </button>
          )}

          {step === 5 && (
            <button
              type="submit"
              className="application-next-btn"
              disabled={
                loading || !agreed
              }
            >
              {loading
                ? "Submitting..."
                : "Submit Application"}

              {!loading && (
                <i className="fa-solid fa-paper-plane" />
              )}
            </button>
          )}

        </div>

      </form>

    </section>
  );
}

/* =========================================================
   PROGRESS
========================================================= */

function ApplicationProgress({
  current,
  onChange,
}: {
  current: Step;
  onChange: (
    step: number
  ) => void;
}) {
  return (
    <div className="merchant-progress">

      {STEPS.map((title, index) => {
        const number =
          index + 1;

        const completed =
          number < current;

        const active =
          number === current;

        return (
          <React.Fragment key={title}>

            <button
              type="button"
              className={`progress-item ${
                active
                  ? "active"
                  : ""
              } ${
                completed
                  ? "completed"
                  : ""
              }`}
              onClick={() =>
                onChange(number)
              }
              disabled={
                number > current
              }
            >

              <span className="progress-circle">

                {completed ? (
                  <i className="fa-solid fa-check" />
                ) : (
                  number
                )}

              </span>

              <span className="progress-title">
                {title}
              </span>

            </button>

            {number < 5 && (
              <span
                className={`progress-connector ${
                  number < current
                    ? "completed"
                    : ""
                }`}
              />
            )}

          </React.Fragment>
        );
      })}

    </div>
  );
}

/* =========================================================
   STEP 1
========================================================= */

function StepOne({
  data,
  updateData,
  fieldErrors,
}: {
  data: ApplicationData;
  updateData: (
    field: keyof ApplicationData,
    value: string | string[]
  ) => void;
  fieldErrors: FieldErrors;
}) {

  const options = useMemo(() => countryList().getData() as Option[], []);
  const [country, setCountry] = useState<Option | null>(null);
  const [countryTouched, setCountryTouched] = useState(false);

  // Keep the react-select value in sync with `data.country`
  // (handles restoring from localStorage on mount).
  useEffect(() => {
    if (data.country && (!country || country.label !== data.country)) {
      const match = options.find(
        (option) => option.label === data.country
      );

      if (match) {
        setCountry(match);
      }
    }
  }, [data.country, options]); // eslint-disable-line react-hooks/exhaustive-deps

  const countryError =
    fieldErrors.country ||
    (countryTouched && !country ? "Country is required." : undefined);

  return (
    <>
      <div className="application-card">

        <div className="card-heading">
          <h2>Basic Information</h2>

          <p>
            Provide your basic details to get started.
          </p>
        </div>

        <div className="row g-4">

          <div className="col-lg-4">

            <Input
              label="Full Name"
              required
              value={data.fullName}
              placeholder="John Michael Smith"
              error={fieldErrors.fullName}
              onChange={(value) =>
                updateData(
                  "fullName",
                  value
                )
              }
            />

            <Input
              label="Username"
              required
              value={data.username}
              placeholder="johnsmith99"
              helper="This will be your merchant username."
              success
              error={fieldErrors.username}
              onChange={(value) =>
                updateData(
                  "username",
                  value
                )
              }
            />

            <Input
              label="Email Address"
              required
              type="email"
              value={data.email}
              placeholder="johnsmith99@gmail.com"
              success
              error={fieldErrors.email}
              onChange={(value) =>
                updateData(
                  "email",
                  value
                )
              }
            />

            

          </div>

          <div className="col-lg-4">

            <div className={`input-wrapper pt-4 pt-md-0 ${countryError ? "has-error" : ""}`}>
              <label>Country <span className="text-danger fs-4">*</span></label>
              <input type="hidden" name="auth-country" value={country?.label ?? ""} />
              <div className="input-single">
                <ReactSelect
                  instanceId="authCountry"
                  options={options}
                  value={country}
                  onChange={(v) => {
                    const selected = v as Option | null;
                    setCountry(selected);
                    setCountryTouched(true);
                    updateData("country", selected?.label ?? "");
                  }}
                  onBlur={() => setCountryTouched(true)}
                  placeholder="Select Country"
                  isSearchable
                  className="w-100 fs-6"
                  classNamePrefix="rs"
                />
                <i className="fa-solid fa-globe" />
              </div>
              <FieldError message={countryError} />
            </div>

            <Textarea
              label="Address"
              required
              value={data.address}
              placeholder="1234 Sunset Blvd, Apt 5B, Los Angeles, CA 90026"
              error={fieldErrors.address}
              onChange={(value) =>
                updateData(
                  "address",
                  value
                )
              }
            />

            <PhoneInput
              label="Phone Number"
              required
              countryCode={data.phoneCountryCode}
              phone={data.phone}
              error={fieldErrors.phone}
              onCountryCodeChange={(value) =>
                updateData("phoneCountryCode", value)
              }
              onPhoneChange={(value) =>
                updateData("phone", value)
              }
            />
          </div>

          <div className="col-lg-4">
            <SideIllustration
              icon="fa-solid fa-id-card"
              title="Start Your Merchant Journey"
              text="Fill the form carefully and attach accurate information. Our team will review your application within 24 hours."
            />

          </div>

        </div>

        <InfoBar>
          All information will be kept secure and used only for verification purposes.
        </InfoBar>

      </div>

      <BenefitsCard />

    </>
  );
}

/* =========================================================
   STEP 2
========================================================= */

function StepTwo({
  data,
  updateData,
  togglePaymentMethod,
  fieldErrors,
}: {
  data: ApplicationData;
  updateData: (
    field: keyof ApplicationData,
    value: string | string[]
  ) => void;
  togglePaymentMethod: (
    method: string
  ) => void;
  fieldErrors: FieldErrors;
}) {
  return (
    <>

      <div className="application-card">

        <div className="card-heading">
          <h2>Business Information</h2>

          <p>
            Tell us about your business and how you plan to trade on LuckySpin.
          </p>
        </div>

        <div className="row g-4">

          <div className="col-lg-4">

            <Select
              label="Business Type"
              required
              value={data.businessType}
              options={[
                "Individual",
                "Company",
                "Partnership",
              ]}
              error={fieldErrors.businessType}
              onChange={(value) =>
                updateData(
                  "businessType",
                  value
                )
              }
            />

            <Input
              label="Business Name"
              value={data.businessName}
              placeholder="Smith Trading LLC"
              onChange={(value) =>
                updateData(
                  "businessName",
                  value
                )
              }
            />

            <Input
              label="Tax ID / NID Number"
              type="number"
              required
              value={data.taxId}
              placeholder="12-3456789"
              success
              error={fieldErrors.taxId}
              onChange={(value) =>
                updateData(
                  "taxId",
                  value
                )
              }
            />

          </div>

          <div className="col-lg-4">

            <Input
              label="Business Contact Email"
              required
              value={data.businessEmail}
              placeholder="smithtrading@gmail.com"
              success
              error={fieldErrors.businessEmail}
              onChange={(value) =>
                updateData(
                  "businessEmail",
                  value
                )
              }
            />

            <PhoneInput
              label="Business Contact Phone"
              required
              countryCode={data.businessPhoneCountryCode}
              phone={data.businessPhone}
              error={fieldErrors.businessPhone}
              onCountryCodeChange={(value) =>
                updateData("businessPhoneCountryCode", value)
              }
              onPhoneChange={(value) =>
                updateData("businessPhone", value)
              }
            />

            <Select
              label="How will you operate your ads?"
              required
              value={data.operationType}
              options={[
                "Manually (I will manage orders)",
                "Automatically",
              ]}
              error={fieldErrors.operationType}
              onChange={(value) =>
                updateData(
                  "operationType",
                  value
                )
              }
            />

          </div>

          <div className="col-lg-4">

            <SideIllustration
              icon="fa-solid fa-store"
              title="Important Notice"
              text="Please provide accurate business information. Incorrect information may result in application rejection or account suspension."
            />

          </div>

        </div>

      </div>

      <div className="application-card">

        <div className="card-heading">
          <h2>Trading Preferences</h2>

          <p>
            Select your preferences to help us understand your trading needs.
          </p>
        </div>

        <div className="row g-3">

          <div className="col-lg-6">

            <Select
              label="Preferred Trade Coin"
              required
              value={data.tradeCoin}
              options={[
                "USDT",
                "USDC",
                "BTC",
              ]}
              error={fieldErrors.tradeCoin}
              onChange={(value) =>
                updateData(
                  "tradeCoin",
                  value
                )
              }
            />

          </div>

          <div className="col-lg-6">

            <label className="field-label">
              Preferred Payment Methods <b>*</b>
            </label>

            <div className="payment-methods">

              {[
                "Bank Transfer",
                "bKash",
                "Nagad",
                "Rocket",
              ].map((method) => (
                <button
                  type="button"
                  key={method}
                  className={
                    data.paymentMethods.includes(
                      method
                    )
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    togglePaymentMethod(
                      method
                    )
                  }
                >
                  {method}

                  {data.paymentMethods.includes(
                    method
                  ) && (
                    <i className="fa-solid fa-check" />
                  )}
                </button>
              ))}

            </div>

            <FieldError message={fieldErrors.paymentMethods} />

          </div>

        </div>

      </div>

    </>
  );
}

/* =========================================================
   STEP 3
========================================================= */

const DEMO_DOCUMENTS = [
  {
    title: "National ID / Passport",
    image: "/images/documents/national-id-demo.jpg",
  },
  {
    title: "Selfie with ID",
    image: "/images/documents/selfie-demo.jpg",
  },
  {
    title: "Business Proof",
    image: "/images/documents/business-proof-demo.jpg",
  },
  {
    title: "Address Proof",
    image: "/images/documents/address-proof-demo.jpg",
  },
];

function StepThree() {
  return (
    <div className="application-card">

      <div className="card-heading">
        <h2>
          Required Documents
        </h2>

        <p>
          Sample of the documents our team reviews as part of every merchant application.
        </p>
      </div>

      <div className="documents-grid">

        {DEMO_DOCUMENTS.map((doc) => (
          <div className="document-upload-card" key={doc.title}>

            <div className="document-card-header">

              <div className="document-icon-small">
                <i className="fa-regular fa-id-card" />
              </div>

              <div>
                <h3>
                  {doc.title}
                </h3>
              </div>

            </div>

            <div className="upload-zone">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={doc.image}
                alt={doc.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
            </div>

          </div>
        ))}

        <div className="document-guidelines">

          <div className="guideline-content">

            <h3>
              Document Guidelines
            </h3>

            <Guideline text="All documents must be valid and unexpired" />
            <Guideline text="Information must be clear and readable" />
            <Guideline text="No edited or cropped documents" />
            <Guideline text="Supported formats: JPG, PNG, PDF" />
            <Guideline text="Maximum file size: 5MB per file" />

          </div>

          <div className="guideline-illustration">
            <i className="fa-solid fa-folder-open" />

            <span>
              <i className="fa-solid fa-shield-halved" />
            </span>
          </div>

        </div>

      </div>

      <div className="important-note">

        <div className="important-icon">
          <i className="fa-solid fa-info" />
        </div>

        <div>
          <strong>
            Important Note
          </strong>

          <p>
            Your application will be reviewed by our team within 24 hours. You will be notified via email and dashboard.
          </p>
        </div>

      </div>

    </div>
  );
}

/* =========================================================
   STEP 4
========================================================= */

function StepFour({
  depositPaid,
  depositTime,
  formatTime,
  requiredDepositAmount,
  walletAmount,
  hasSufficientBalance,
  depositInfoLoading,
}: {
  depositPaid: boolean;
  depositTime: number;
  formatTime: (
    seconds: number
  ) => string;
  requiredDepositAmount: number;
  walletAmount: number;
  hasSufficientBalance: boolean;
  depositInfoLoading: boolean;
}) {

  const router = useRouter();

  const onDepositClick = () => {
        router.push("/dashboard/wallet/?tab=tab2");
  };

  return (
    <div className="deposit-layout">

      <div className="deposit-left">

        <div className="application-card">

          <div className="card-heading">
            <h2>Security Deposit</h2>

            <p>
              A security deposit helps us maintain a safe and trusted P2P marketplace.
            </p>
          </div>

          <div className="deposit-information">

            <h3>
              Deposit Information
            </h3>

            <div className="deposit-info-grid">

              <div className="required-deposit">

                <small>
                  Required Amount
                </small>

                <div className="deposit-amount">

                  <span className="deposit-shield">
                    <i className="fa-solid fa-shield-halved" />
                  </span>

                  <strong>
                    {depositInfoLoading ? "--" : requiredDepositAmount}
                  </strong>

                  <span>
                    USDT
                  </span>

                </div>

                <b>
                  Refundable
                </b>

              </div>

              <div className="required-deposit">

                <small>
                  Your Wallet Balance
                </small>

                <div className="deposit-amount">

                  <span className="deposit-shield">
                    <i className="fa-solid fa-wallet" />
                  </span>

                  <strong>
                    {depositInfoLoading ? "--" : walletAmount.toFixed(2)}
                  </strong>

                  <span>
                    USDT
                  </span>

                </div>

                {!depositInfoLoading && (
                  <b className={hasSufficientBalance ? "text-success" : "text-warning"}>
                    {hasSufficientBalance ? "Sufficient" : "Insufficient"}
                  </b>
                )}

              </div>

              <div className="deposit-purpose">

                <strong>
                  Purpose
                </strong>

                <Purpose text="Build trust & credibility" />
                <Purpose text="Protect buyers & sellers" />
                <Purpose text="Ensure fair trading" />
                <Purpose text="100% refundable" />

              </div>

            </div>

          </div>

        </div>

        <div className="application-card">

          <div className="card-heading">
            <h2>How It Works</h2>
          </div>

          <div className="deposit-steps">

            <DepositStep
              icon="fa-solid fa-wallet"
              title="Make Deposit"
              text={`Deposit ${requiredDepositAmount} USDT to the provided address, or use an existing wallet balance that already covers it.`}
            />

            <i className="fa-solid fa-arrow-right deposit-arrow" />

            <DepositStep
              icon="fa-solid fa-shield-halved"
              title="System Verification"
              text="Our system will verify your payment or balance."
            />

            <i className="fa-solid fa-arrow-right deposit-arrow" />

            <DepositStep
              icon="fa-solid fa-store"
              title="Start Trading"
              text="Once verified, you can create ads and trade."
            />

            <i className="fa-solid fa-arrow-right deposit-arrow" />

            <DepositStep
              icon="fa-solid fa-rotate-left"
              title="Refund Anytime"
              text="You can withdraw your deposit anytime."
            />

          </div>

          <InfoBar>
            Your deposit is safe with us and will be refunded to your wallet when you request.
          </InfoBar>

        </div>

      </div>

      <div className="deposit-payment">

        {depositInfoLoading && (
          <div className="payment-card">
            <div className="card-heading">
              <h2>Checking Your Balance</h2>
              <p>
                Hang tight while we check your wallet balance against the required security deposit.
              </p>
            </div>
          </div>
        )}

        {!depositInfoLoading && hasSufficientBalance && (
          <div className="payment-card">

            <div className="card-heading">
              <h2>No Deposit Needed</h2>

              <p>
                Your wallet balance already covers the required security deposit.
              </p>
            </div>

            <div className="pay-box">
              <small>
                Your Wallet Balance
              </small>

              <strong>
                <span className="usdt-dot">
                  ₮
                </span>

                {walletAmount.toFixed(2)} USDT
              </strong>
            </div>

            <div className="payment-status">
              <div>
                <strong>
                  Balance Covers Deposit
                </strong>

                <small>
                  Required: {requiredDepositAmount} USDT
                </small>
              </div>

              <span className="paid-status">
                <i className="fa-solid fa-check" />
                Ready
              </span>
            </div>

            <InfoBar>
              You do not need to send a separate deposit. Click &quot;Continue&quot; below to move on with your application.
            </InfoBar>

          </div>
        )}

        {!depositInfoLoading && !hasSufficientBalance && (
          <div className="payment-card">
            {/* Show deposit button or instructions here for users who need to make a deposit. */}
            <div className="card-heading">
              <h2>Deposit Required</h2>

              <p>
                Your wallet balance does not cover the required security deposit. Please make a deposit to proceed.
              </p>
            </div>

            <div className="pay-box">
              <small>
                Required Deposit Amount
              </small>

              <strong>
                <span className="usdt-dot">
                  ₮
                </span>

                {requiredDepositAmount} USDT
              </strong>
            </div>

            <button
              type="button"
              className="merchant-purple-btn"
              onClick={onDepositClick}
            >
              I Have Deposited
            </button>

            <InfoBar>
              After making the deposit, click &quot;I Have Deposited&quot; to verify and continue with your application.
            </InfoBar>
          </div>
        )}

      </div>

    </div>
  );
}

/* =========================================================
   STEP 5
========================================================= */

function StepFive({
  data,
  depositPaid,
  agreed,
  setAgreed,
  agreedError,
  onEdit,
}: {
  data: ApplicationData;
  depositPaid: boolean;
  agreed: boolean;
  setAgreed: (
    value: boolean
  ) => void;
  agreedError?: string;
  onEdit: (
    step: Step
  ) => void;
}) {
  return (
    <div className="review-page">

      <div className="review-card">

        <div className="review-header">

          <div>
            <h2>
              Review Your Application
            </h2>

            <p>
              Please verify all the information before final submission.
            </p>
          </div>

          <span className="review-good">
            <i className="fa-solid fa-check" />
            All information looks good
          </span>

        </div>

        <div className="review-grid">

          <ReviewInformation
            icon="fa-solid fa-user"
            title="Personal Information"
            step={1}
            onEdit={onEdit}
            rows={[
              ["Full Name", data.fullName],
              ["Username", data.username],
              ["Email", data.email],
              [
                "Phone Number",
                data.phone
                  ? `${data.phoneCountryCode} ${data.phone}`
                  : "",
              ],
              ["Country", data.country],
            ]}
          />

          <ReviewInformation
            icon="fa-solid fa-building"
            title="Business Information"
            step={2}
            onEdit={onEdit}
            rows={[
              [
                "Business Type",
                data.businessType,
              ],
              [
                "Business Name",
                data.businessName ||
                  "Smith Trading LLC",
              ],
              [
                "Tax ID / NID Number",
                data.taxId,
              ],
              [
                "Business Email",
                data.businessEmail,
              ],
              [
                "Business Phone",
                data.businessPhone
                  ? `${data.businessPhoneCountryCode} ${data.businessPhone}`
                  : "",
              ],
            ]}
          />

          <div className="review-section">

            <ReviewSectionHeader
              icon="fa-solid fa-file-lines"
              title="Documents"
              onEdit={() =>
                onEdit(3)
              }
            />

            {DEMO_DOCUMENTS.map((doc) => (
              <DocumentReview
                key={doc.title}
                title={doc.title}
                uploaded
              />
            ))}

            <div className="documents-valid">
              <i className="fa-solid fa-circle-check" />
              All documents verified
              <span>Valid</span>
            </div>

          </div>

        </div>

      </div>

      <div className="review-bottom-grid">

        <div className="review-section deposit-review">

          <ReviewSectionHeader
            icon="fa-solid fa-shield-halved"
            title="Security Deposit Summary"
            onEdit={() =>
              onEdit(4)
            }
          />

          <div className="security-summary">

            <div className="big-security-icon">
              <i className="fa-solid fa-shield-halved" />
            </div>

            <div>
              <small>
                Deposit Status
              </small>

              <strong>
                <i className="fa-solid fa-circle-check" />
                {depositPaid ? "Satisfied" : "Pending"}
              </strong>

              <small>
                Network
              </small>

              <span>
                TRC20 (Tron)
              </span>

              <b>
                100% Refundable
              </b>
            </div>

          </div>

          <div className="deposit-completed">
            <i className="fa-solid fa-check" />
            {depositPaid
              ? "Ready to Submit"
              : "Pending"}
          </div>

        </div>

        <div className="review-section">

          <h3>
            {"What You'll Get as Merchant"}
          </h3>

          <div className="review-benefits">

            <ReviewBenefit
              icon="fa-solid fa-store"
              title="Create Ads"
              text="Buy & Sell USDT"
            />

            <ReviewBenefit
              icon="fa-solid fa-coins"
              title="Earn 2%"
              text="Commission"
            />

            <ReviewBenefit
              icon="fa-solid fa-shield-halved"
              title="Secure Trading"
              text="& Protection"
            />

            <ReviewBenefit
              icon="fa-solid fa-circle-check"
              title="Verified Badge"
              text="& More Trust"
            />

          </div>

        </div>

      </div>

      <div className="important-review-note">

        <div className="blue-info">
          <i className="fa-solid fa-info" />
        </div>

        <div>
          <strong>
            Important Note
          </strong>

          <p>
            Once you submit, our team will review your application within 24 hours. You will be notified via email and dashboard.
          </p>
        </div>

      </div>

      <label className="agreement">

        <input
          type="checkbox"
          checked={agreed}
          onChange={(event) =>
            setAgreed(
              event.target.checked
            )
          }
        />

        <span className="custom-checkbox">
          {agreed && (
            <i className="fa-solid fa-check" />
          )}
        </span>

        <span>
          I confirm that all the information
          provided is accurate and I agree to
          the{" "}
          <a href="#">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#">
            P2P Policy
          </a>
          .
        </span>

      </label>

      <FieldError message={agreedError} />

      <div className="secure-submit">

        <div>
          <i className="fa-solid fa-shield-halved" />
        </div>

        <span>
          <strong>
            Your data is 100% secure
          </strong>

          <small>
            We never share your information
          </small>
        </span>

      </div>

    </div>
  );
}

/* =========================================================
   INPUT COMPONENTS
========================================================= */

function Input({
  label,
  required,
  value,
  placeholder,
  helper,
  success,
  icon,
  type,
  error,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  placeholder?: string;
  helper?: string;
  success?: boolean;
  icon?: string;
  type?: string;
  error?: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div className="field-group">

      <label className="field-label">
        {label}

        {required && <b>*</b>}
      </label>

      <div className="field-input-wrapper">

        {icon && (
          <i
            className={`field-left-icon ${icon}`}
          />
        )}

        <input
          type={type ?? 'text'}
          value={value}
          placeholder={placeholder}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className={[
            icon ? "has-left-icon" : "",
            error ? "has-error" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />

        {success && value && !error && (
          <i className="fa-solid fa-circle-check field-success" />
        )}

      </div>

      {helper && !error && (
        <small className="field-helper">
          {helper}
        </small>
      )}

      <FieldError message={error} />

    </div>
  );
}

function Textarea({
  label,
  required,
  value,
  placeholder,
  error,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  placeholder?: string;
  error?: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div className="field-group">

      <label className="field-label">
        {label}

        {required && <b>*</b>}
      </label>

      <textarea
        value={value}
        placeholder={placeholder}
        className={error ? "has-error" : ""}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
      />

      <FieldError message={error} />

    </div>
  );
}

function Select({
  label,
  required,
  value,
  options,
  error,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  options: string[];
  error?: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div className="field-group">

      <label className="field-label">
        {label}

        {required && <b>*</b>}
      </label>

      <div className={`select-input-wrapper ${error ? "has-error" : ""}`}>

        <select
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
        >
          {options.map(
            (option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            )
          )}
        </select>

        <i className="fa-solid fa-chevron-down" />

      </div>

      <FieldError message={error} />

    </div>
  );
}

/* =========================================================
   PHONE INPUT (matches Account page's phone-input-container)
========================================================= */

function PhoneInput({
  label,
  required,
  countryCode,
  phone,
  error,
  onCountryCodeChange,
  onPhoneChange,
}: {
  label: string;
  required?: boolean;
  countryCode: string;
  phone: string;
  error?: string;
  onCountryCodeChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
}) {
  return (
    <div className="field-group">

      <label className="field-label">
        {label}

        {required && <b>*</b>}
      </label>

      <div className={`phone-input-container ${error ? "has-error" : ""}`}>
        <div className="country-code">
          <select className="bg-transparent"
            value={countryCode}
            onChange={(event) =>
              onCountryCodeChange(event.target.value)
            }
          >
            {allCountries.map((country: CountryTelephoneData) => (
              <option key={country.iso2} value={`+${country.dialCode}`}>
                 (+{country.dialCode})
              </option>
            ))}
          </select>
        </div>

        <div className="divider" />

        <input
          className="bg-transparent ps-2"
          type="text"
          placeholder="(555) 123-4567"
          value={phone}
          onChange={(event) =>
            onPhoneChange(event.target.value)
          }
        />
      </div>

      <FieldError message={error} />

    </div>
  );
}

/* =========================================================
   BENEFITS
========================================================= */

function BenefitsCard() {
  return (
    <div className="application-card benefits-card">

      <div className="card-heading">
        <h2>
          {"What You'll Get as a Merchant"}
        </h2>
      </div>

      <div className="row g-3">

        <Benefit
          icon="fa-solid fa-store"
          title="Create Ads"
          text="Create Buy & Sell ads and reach thousands of active traders."
        />

        <Benefit
          icon="fa-solid fa-coins"
          title="Earn 2% Commission"
          text="Get 2% commission on every completed order from your ads."
        />

        <Benefit
          icon="fa-solid fa-shield-halved"
          title="Secure & Safe"
          text="Advanced security system to protect your funds and transactions."
        />

        <Benefit
          icon="fa-solid fa-chart-line"
          title="Business Growth"
          text="Increase your visibility and grow your P2P trading business."
        />

      </div>

    </div>
  );
}

function Benefit({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="col-sm-6 col-xl-3">

      <div className="benefit-card">

        <div className="benefit-icon">
          <i className={icon} />
        </div>

        <h3>{title}</h3>

        <p>{text}</p>

      </div>

    </div>
  );
}

/* =========================================================
   SIDE ILLUSTRATION
========================================================= */

function SideIllustration({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="side-illustration">

      <div className="side-icon-art">
        <i className={icon} />

        <span>
          <i className="fa-solid fa-shield-halved" />
        </span>
      </div>

      <h3>{title}</h3>

      <p>{text}</p>

    </div>
  );
}

/* =========================================================
   INFO BAR
========================================================= */

function InfoBar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="application-info-bar">

      <span>
        <i className="fa-solid fa-info" />
      </span>

      <p>{children}</p>

    </div>
  );
}

/* =========================================================
   GUIDELINES
========================================================= */

function Guideline({
  text,
}: {
  text: string;
}) {
  return (
    <div className="guideline-row">

      <i className="fa-solid fa-circle-check" />

      <span>{text}</span>

    </div>
  );
}

/* =========================================================
   DEPOSIT
========================================================= */

function Purpose({
  text,
}: {
  text: string;
}) {
  return (
    <div className="purpose-row">

      <i className="fa-solid fa-circle-check" />

      <span>{text}</span>

    </div>
  );
}

function DepositStep({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="deposit-step">

      <div>
        <i className={icon} />
      </div>

      <strong>{title}</strong>

      <p>{text}</p>

    </div>
  );
}

/* =========================================================
   REVIEW
========================================================= */

function ReviewInformation({
  icon,
  title,
  step,
  rows,
  onEdit,
}: {
  icon: string;
  title: string;
  step: Step;
  rows: [string, string][];
  onEdit: (
    step: Step
  ) => void;
}) {
  return (
    <div className="review-section">

      <ReviewSectionHeader
        icon={icon}
        title={title}
        onEdit={() =>
          onEdit(step)
        }
      />

      {rows.map(
        ([label, value]) => (
          <div
            className="review-row"
            key={label}
          >
            <span>
              <i className="fa-solid fa-circle-check" />
              {label}
            </span>

            <strong>
              {value || "-"}
            </strong>
          </div>
        )
      )}

    </div>
  );
}

function ReviewSectionHeader({
  icon,
  title,
  onEdit,
}: {
  icon: string;
  title: string;
  onEdit: () => void;
}) {
  return (
    <div className="review-section-header">

      <div>
        <span>
          <i className={icon} />
        </span>

        <strong>
          {title}
        </strong>
      </div>

      <button
        type="button"
        onClick={onEdit}
      >
        <i className="fa-solid fa-pen" />
        Edit
      </button>

    </div>
  );
}

function DocumentReview({
  title,
  uploaded,
}: {
  title: string;
  uploaded: boolean;
}) {
  return (
    <div className="document-review-row">

      <span>
        <i className="fa-regular fa-id-card" />
        {title}
      </span>

      <strong>
        {uploaded
          ? "Uploaded"
          : "Missing"}
      </strong>

      <i
        className={
          uploaded
            ? "fa-solid fa-circle-check"
            : "fa-solid fa-circle-xmark"
        }
      />

    </div>
  );
}

function ReviewBenefit({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="review-benefit">

      <div>
        <i className={icon} />
      </div>

      <strong>{title}</strong>

      <span>{text}</span>

    </div>
  );
}