import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Mail,
  Phone,
  IdCard,
  MapPin,
  Briefcase,
  ShieldCheck,
  Sparkles,
  Camera,
  Upload,
  FileSignature,
  Lock,
  Loader2,
  RefreshCw,
  BadgeCheck,
  ScanFace,
  Copy,
  X,
} from "lucide-react";

export const Route = createFileRoute("/open-account")({
  component: OpenAccount,
  head: () => ({
    meta: [
      { title: "Open Account — Bankislami" },
      {
        name: "description",
        content:
          "Open your Bankislami digital account in minutes. SBP-compliant KYC with live selfie, OTP, and document verification.",
      },
    ],
  }),
});

// ---------- Validation ----------
const cnicRegex = /^\d{5}-\d{7}-\d$/;
const msisdnRegex = /^03\d{2}-\d{7}$/;

const accountTypes = [
  {
    id: "asaan",
    name: "Asaan Digital",
    desc: "Simplified KYC for low-risk retail customers",
    limit: "Monthly limit ₨ 500,000",
  },
  {
    id: "freelancer",
    name: "Freelancer",
    desc: "For registered freelancers earning FX inflows",
    limit: "Higher inward-remittance limits",
  },
  {
    id: "current",
    name: "Current Account",
    desc: "Everyday transactional account with cheque book",
    limit: "No profit, unlimited transactions",
  },
  {
    id: "saving",
    name: "Saving Account",
    desc: "Earn monthly profit on your balance",
    limit: "Halal profit sharing model",
  },
] as const;

type FormData = {
  // Verification
  accountType: string;
  cnic: string;
  msisdn: string;
  simVerified: boolean;
  mobileOtpVerified: boolean;
  emailOtpVerified: boolean;
  captchaVerified: boolean;

  // Personal
  fullName: string;
  fatherName: string;
  motherName: string;
  email: string;
  dob: string;
  gender: string;
  nationality: string;
  placeOfBirth: string;

  // Identity docs
  cnicFront: string; // data-url preview only, not persisted
  cnicBack: string;
  cnicIssueDate: string;
  cnicExpiryDate: string;

  // Address
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;

  // Financial
  employment: string;
  occupation: string;
  employer: string;
  income: string;
  sourceOfFunds: string;
  purposeOfAccount: string;

  // Media
  livePhoto: string;
  signature: string;
  proofOfBusiness: string;

  // Consents
  termsKfs: boolean;
  fatcaCrs: boolean;
  beneficialOwner: boolean;
  zakatExempt: boolean;

  // Currency
  currency: string;
};

const initial: FormData = {
  accountType: "",
  cnic: "",
  msisdn: "",
  simVerified: false,
  mobileOtpVerified: false,
  emailOtpVerified: false,
  captchaVerified: false,
  fullName: "",
  fatherName: "",
  motherName: "",
  email: "",
  dob: "",
  gender: "",
  nationality: "Pakistani",
  placeOfBirth: "",
  cnicFront: "",
  cnicBack: "",
  cnicIssueDate: "",
  cnicExpiryDate: "",
  address: "",
  city: "",
  province: "",
  postalCode: "",
  country: "Pakistan",
  employment: "",
  occupation: "",
  employer: "",
  income: "",
  sourceOfFunds: "",
  purposeOfAccount: "",
  livePhoto: "",
  signature: "",
  proofOfBusiness: "",
  termsKfs: false,
  fatcaCrs: false,
  beneficialOwner: false,
  zakatExempt: false,
  currency: "PKR",
};

const steps = [
  { title: "Verify", icon: ShieldCheck, desc: "Confirm identity & contact" },
  { title: "Personal", icon: User, desc: "Tell us about you" },
  { title: "Identity", icon: IdCard, desc: "CNIC documents" },
  { title: "Address", icon: MapPin, desc: "Where you live" },
  { title: "Financial", icon: Briefcase, desc: "Your background" },
  { title: "Media", icon: Camera, desc: "Live selfie & signature" },
  { title: "Consents", icon: FileSignature, desc: "Declarations" },
  { title: "Review", icon: Sparkles, desc: "Submit application" },
];

// ---------- Persistence (autosave, no sensitive files) ----------
const STORAGE_KEY = "bki-aof-draft";
const SENSITIVE_KEYS: (keyof FormData)[] = [
  "cnicFront",
  "cnicBack",
  "livePhoto",
  "signature",
  "proofOfBusiness",
  "mobileOtpVerified",
  "emailOtpVerified",
  "simVerified",
  "captchaVerified",
];

function loadDraft(): Partial<FormData> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<FormData>) : null;
  } catch {
    return null;
  }
}
function saveDraft(data: FormData, step: number) {
  if (typeof window === "undefined") return;
  const safe: Record<string, unknown> = { __step: step };
  for (const [k, v] of Object.entries(data)) {
    if (SENSITIVE_KEYS.includes(k as keyof FormData)) continue;
    safe[k] = v;
  }
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  } catch {
    /* noop */
  }
}
function clearDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

function OpenAccount() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<FormData>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [resumedNotice, setResumedNotice] = useState(false);

  // Hydrate draft
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      const { __step, ...rest } = draft as Partial<FormData> & { __step?: number };
      setData((d) => ({ ...d, ...rest }));
      if (typeof __step === "number") setStep(Math.min(__step, steps.length - 1));
      setResumedNotice(true);
      const t = setTimeout(() => setResumedNotice(false), 4000);
      return () => clearTimeout(t);
    }
  }, []);

  // Autosave
  useEffect(() => {
    if (!trackingId) saveDraft(data, step);
  }, [data, step, trackingId]);

  const update = (k: keyof FormData, v: FormData[keyof FormData]) => {
    setData((d) => ({ ...d, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validateStep = (): boolean => {
    // Testing mode: bypass all validation
    setErrors({});
    return true;
  };


  const next = async () => {
    if (!validateStep()) return;
    if (step === steps.length - 1) {
      // Submit
      setSubmitting(true);
      await new Promise((r) => setTimeout(r, 1600));
      const id =
        "BKI-" +
        new Date().toISOString().slice(0, 10).replace(/-/g, "") +
        "-" +
        Math.random().toString(36).slice(2, 7).toUpperCase();
      setTrackingId(id);
      setSubmitting(false);
      clearDraft();
      return;
    }
    setDirection(1);
    setStep((s) => s + 1);
  };
  const back = () => {
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-[20%] -left-[10%] w-[55%] h-[55%] rounded-full blur-[140px] animate-drift"
          style={{ background: "color-mix(in oklab, var(--brand-primary) 14%, transparent)" }}
        />
        <div
          className="absolute top-[30%] -right-[10%] w-[50%] h-[50%] rounded-full blur-[140px] animate-drift"
          style={{
            background: "color-mix(in oklab, var(--brand-secondary) 14%, transparent)",
            animationDelay: "-6s",
          }}
        />
      </div>

      <nav className="px-6 py-6 max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary shadow-glow-primary" />
          <span className="font-display font-extrabold text-xl tracking-tight">BANKISLAMI</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-foreground/50">
            <Lock className="size-3.5" /> Encrypted end-to-end · No local storage of documents
          </span>
          <Link
            to="/"
            className="text-sm text-foreground/60 hover:text-foreground inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="size-4" /> Back to home
          </Link>
        </div>
      </nav>

      <main className="px-6 pb-24 max-w-5xl mx-auto">
        <AnimatePresence>
          {resumedNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 glass-card rounded-xl px-4 py-3 text-sm text-foreground/70 inline-flex items-center gap-2"
            >
              <RefreshCw className="size-4 text-brand-primary" />
              Resumed your saved application. Documents & OTPs need re-verification for security.
            </motion.div>
          )}
        </AnimatePresence>

        {trackingId ? (
          <SuccessScreen data={data} trackingId={trackingId} />
        ) : (
          <>
            <Stepper current={step} />
            <div className="mt-10 glass-card rounded-[2rem] p-6 md:p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-aurora opacity-50 -z-10" />
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -60 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  <StepHeader step={step} />
                  <div className="mt-8">
                    {step === 0 && <Step0Verify data={data} errors={errors} update={update} />}
                    {step === 1 && <Step1Personal data={data} errors={errors} update={update} />}
                    {step === 2 && <Step2Identity data={data} errors={errors} update={update} />}
                    {step === 3 && <Step3Address data={data} errors={errors} update={update} />}
                    {step === 4 && <Step4Financial data={data} errors={errors} update={update} />}
                    {step === 5 && <Step5Media data={data} errors={errors} update={update} />}
                    {step === 6 && <Step6Consents data={data} errors={errors} update={update} />}
                    {step === 7 && <Step7Review data={data} />}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-10 flex items-center justify-between pt-6 border-t border-foreground/5">
                <button
                  onClick={back}
                  disabled={step === 0 || submitting}
                  className="px-5 py-3 rounded-xl text-sm font-semibold text-foreground/70 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="size-4" /> Back
                </button>
                <motion.button
                  whileHover={{ scale: submitting ? 1 : 1.03 }}
                  whileTap={{ scale: submitting ? 1 : 0.97 }}
                  onClick={next}
                  disabled={submitting}
                  className="px-7 py-3 rounded-xl bg-brand-primary text-primary-foreground font-bold text-sm cursor-pointer shadow-glow-primary inline-flex items-center gap-2 disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Submitting…
                    </>
                  ) : step === steps.length - 1 ? (
                    <>Submit application <ArrowRight className="size-4" /></>
                  ) : (
                    <>Continue <ArrowRight className="size-4" /></>
                  )}
                </motion.button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// ---------- Stepper ----------
function Stepper({ current }: { current: number }) {
  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <div className="flex items-center gap-1 md:gap-2 mt-4 min-w-max md:min-w-0">
        {steps.map((s, i) => {
          const active = i === current;
          const completed = i < current;
          const Icon = s.icon;
          return (
            <div key={s.title} className="flex items-center gap-1 md:gap-2 flex-1">
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  animate={{
                    scale: active ? 1.1 : 1,
                    backgroundColor: completed
                      ? "var(--brand-primary)"
                      : active
                      ? "color-mix(in oklab, var(--brand-primary) 20%, transparent)"
                      : "rgba(255,255,255,0.04)",
                  }}
                  transition={{ duration: 0.3 }}
                  className={`size-10 md:size-11 rounded-2xl border flex items-center justify-center backdrop-blur-xl ${
                    active || completed ? "border-brand-primary/40" : "border-foreground/10"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {completed ? (
                      <motion.div
                        key="c"
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                      >
                        <Check className="size-4 text-primary-foreground" />
                      </motion.div>
                    ) : (
                      <motion.div key="i" initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                        <Icon
                          className={`size-4 ${active ? "text-brand-primary" : "text-foreground/40"}`}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                <span
                  className={`text-[10px] font-semibold tracking-wide uppercase hidden md:block ${
                    active ? "text-foreground" : "text-foreground/40"
                  }`}
                >
                  {s.title}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-px bg-foreground/10 relative overflow-hidden rounded-full min-w-[16px]">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: i < current ? 1 : 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{ originX: 0 }}
                    className="absolute inset-0 bg-gradient-to-r from-brand-primary to-brand-secondary"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepHeader({ step }: { step: number }) {
  const s = steps[step];
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-brand-primary font-bold mb-2">
        Step {step + 1} of {steps.length}
      </p>
      <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
        {s.title === "Verify" ? "Identity verification" : `${s.title} details`}
      </h2>
      <p className="text-foreground/50 mt-2">{s.desc}</p>
    </div>
  );
}

// ---------- Primitives ----------
function Field({
  label, error, icon, children, hint,
}: {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2 flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      {children}
      {hint && !error && <span className="block mt-1.5 text-xs text-foreground/40">{hint}</span>}
      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="block mt-1.5 text-xs text-brand-danger"
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  );
}

const inputCls =
  "w-full px-4 py-3 rounded-xl bg-foreground/5 border border-foreground/10 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-brand-primary/60 focus:bg-foreground/[0.07] transition-all";

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls + " " + (props.className ?? "")} />;
}

function SelectInput({
  value, onChange, options, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls + " appearance-none cursor-pointer"}
    >
      <option value="" disabled className="bg-background">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-background">
          {o.label}
        </option>
      ))}
    </select>
  );
}

type StepProps = {
  data: FormData;
  errors: Record<string, string>;
  update: (k: keyof FormData, v: FormData[keyof FormData]) => void;
};

// ---------- Step 0: Verify ----------
function Step0Verify({ data, errors, update }: StepProps) {
  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-3 block">
          Select account type
        </span>
        <div className="grid md:grid-cols-2 gap-3">
          {accountTypes.map((t) => {
            const active = data.accountType === t.id;
            return (
              <motion.button
                key={t.id}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => update("accountType", t.id)}
                className={`text-left p-4 rounded-2xl border transition-all ${
                  active
                    ? "border-brand-primary bg-brand-primary/10 shadow-glow-primary"
                    : "border-foreground/10 bg-foreground/[0.03] hover:bg-foreground/[0.06]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display font-bold">{t.name}</span>
                  {active && <BadgeCheck className="size-4 text-brand-primary" />}
                </div>
                <p className="text-xs text-foreground/60">{t.desc}</p>
                <p className="text-[11px] text-brand-primary/80 mt-2">{t.limit}</p>
              </motion.button>
            );
          })}
        </div>
        {errors.accountType && <p className="mt-2 text-xs text-brand-danger">{errors.accountType}</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Field
          label="CNIC number"
          error={errors.cnic}
          icon={<IdCard className="size-3.5" />}
        >
          <TextInput
            value={data.cnic}
            onChange={(e) => update("cnic", formatCnic(e.target.value))}
            placeholder="12345-1234567-1"
            maxLength={15}
            inputMode="numeric"
          />
        </Field>
        <Field
          label="Mobile number (MSISDN)"
          error={errors.msisdn}
          icon={<Phone className="size-3.5" />}
        >
          <TextInput
            value={data.msisdn}
            onChange={(e) => update("msisdn", formatMsisdn(e.target.value))}
            placeholder="03XX-XXXXXXX"
            maxLength={12}
            inputMode="numeric"
          />
        </Field>
      </div>

      <SimVerifyPanel data={data} errors={errors} update={update} />

      <OtpPanel
        title="Mobile OTP"
        subtitle={`We'll send a 6-digit code to ${data.msisdn || "your mobile"}`}
        target={data.msisdn}
        icon={<Phone className="size-4" />}
        verified={data.mobileOtpVerified}
        onVerified={() => update("mobileOtpVerified", true)}
        error={errors.mobileOtpVerified}
        disabled={!msisdnRegex.test(data.msisdn) || !data.simVerified}
      />

      <div>
        <Field label="Email address" error={errors.email} icon={<Mail className="size-3.5" />}>
          <TextInput
            type="email"
            value={data.email}
            onChange={(e) => {
              update("email", e.target.value);
              if (data.emailOtpVerified) update("emailOtpVerified", false);
            }}
            placeholder="you@example.com"
            maxLength={255}
          />
        </Field>
      </div>

      <OtpPanel
        title="Email OTP"
        subtitle={`We'll send a 6-digit code to ${data.email || "your email"}`}
        target={data.email}
        icon={<Mail className="size-4" />}
        verified={data.emailOtpVerified}
        onVerified={() => update("emailOtpVerified", true)}
        error={errors.emailOtpVerified}
        disabled={!z.string().email().safeParse(data.email).success}
      />

      <CaptchaPanel
        verified={data.captchaVerified}
        onVerified={(v) => update("captchaVerified", v)}
        error={errors.captchaVerified}
      />
    </div>
  );
}

function formatCnic(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 13);
  if (d.length <= 5) return d;
  if (d.length <= 12) return `${d.slice(0, 5)}-${d.slice(5)}`;
  return `${d.slice(0, 5)}-${d.slice(5, 12)}-${d.slice(12)}`;
}
function formatMsisdn(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 4) return d;
  return `${d.slice(0, 4)}-${d.slice(4)}`;
}

// ---------- SIM Ownership Verify (simulated PMD API) ----------
function SimVerifyPanel({ data, errors, update }: StepProps) {
  const [status, setStatus] = useState<"idle" | "checking" | "ok" | "fail">(
    data.simVerified ? "ok" : "idle",
  );
  const ready = cnicRegex.test(data.cnic) && msisdnRegex.test(data.msisdn);

  const run = async () => {
    setStatus("checking");
    await new Promise((r) => setTimeout(r, 1400));
    // Simulated pass rule: last digit of CNIC not 0
    const last = data.cnic.slice(-1);
    const ok = last !== "0";
    setStatus(ok ? "ok" : "fail");
    update("simVerified", ok);
  };

  return (
    <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-semibold flex items-center gap-2">
            <ScanFace className="size-4 text-brand-primary" /> SIM ownership verification
          </p>
          <p className="text-xs text-foreground/50 mt-1">
            We check your CNIC ↔ MSISDN pairing with the operator's PMD registry.
          </p>
        </div>
        <button
          type="button"
          disabled={!ready || status === "checking"}
          onClick={run}
          className="px-4 py-2 rounded-lg bg-brand-primary/90 text-primary-foreground text-xs font-semibold disabled:opacity-40 inline-flex items-center gap-2 cursor-pointer"
        >
          {status === "checking" ? (
            <><Loader2 className="size-3.5 animate-spin" /> Checking…</>
          ) : status === "ok" ? (
            <><Check className="size-3.5" /> Verified</>
          ) : (
            "Verify SIM"
          )}
        </button>
      </div>
      {status === "fail" && (
        <p className="mt-3 text-xs text-brand-danger">
          The CNIC and mobile number do not match any registered SIM. Please review and retry.
        </p>
      )}
      {errors.simVerified && status !== "ok" && (
        <p className="mt-2 text-xs text-brand-danger">{errors.simVerified}</p>
      )}
    </div>
  );
}

// ---------- OTP Panel ----------
function OtpPanel({
  title, subtitle, target, icon, verified, onVerified, error, disabled,
}: {
  title: string;
  subtitle: string;
  target: string;
  icon: React.ReactNode;
  verified: boolean;
  onVerified: () => void;
  error?: string;
  disabled?: boolean;
}) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [code, setCode] = useState("");
  const [expected, setExpected] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [wrong, setWrong] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const send = async () => {
    setSending(true);
    await new Promise((r) => setTimeout(r, 900));
    const c = Math.floor(100000 + Math.random() * 900000).toString();
    setExpected(c);
    setSent(true);
    setSending(false);
    setSeconds(60);
    // Demo aid — surface the code in console; real system would deliver via SMS/Email
    console.info(`[Bankislami demo] ${title} code for ${target}: ${c}`);
  };

  const verify = () => {
    if (code === expected) {
      onVerified();
      setWrong(false);
    } else {
      setWrong(true);
    }
  };

  return (
    <div className={`rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-5 ${disabled ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-semibold flex items-center gap-2">{icon} {title}</p>
          <p className="text-xs text-foreground/50 mt-1">{subtitle}</p>
        </div>
        {!verified ? (
          <button
            type="button"
            disabled={disabled || sending || seconds > 0}
            onClick={send}
            className="px-4 py-2 rounded-lg bg-foreground/10 text-foreground text-xs font-semibold disabled:opacity-40 inline-flex items-center gap-2 cursor-pointer hover:bg-foreground/15"
          >
            {sending ? <><Loader2 className="size-3.5 animate-spin" /> Sending…</> : seconds > 0 ? `Resend in ${seconds}s` : sent ? "Resend code" : "Send code"}
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary">
            <BadgeCheck className="size-4" /> Verified
          </span>
        )}
      </div>

      {sent && !verified && (
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
              setWrong(false);
            }}
            placeholder="6-digit code"
            inputMode="numeric"
            className={inputCls + " max-w-[180px] tracking-[0.4em] text-center font-mono"}
          />
          <button
            type="button"
            disabled={code.length !== 6}
            onClick={verify}
            className="px-4 py-2 rounded-lg bg-brand-primary text-primary-foreground text-xs font-semibold disabled:opacity-40 cursor-pointer"
          >
            Verify
          </button>
          {wrong && <span className="text-xs text-brand-danger">Incorrect code — try again.</span>}
          <span className="text-[11px] text-foreground/40">
            Demo: code is printed in browser console.
          </span>
        </div>
      )}
      {error && !verified && <p className="mt-3 text-xs text-brand-danger">{error}</p>}
    </div>
  );
}

// ---------- CAPTCHA ----------
function CaptchaPanel({
  verified, onVerified, error,
}: {
  verified: boolean;
  onVerified: (v: boolean) => void;
  error?: string;
}) {
  const [q, setQ] = useState(() => genCaptcha());
  const [ans, setAns] = useState("");
  const [wrong, setWrong] = useState(false);

  const refresh = () => {
    setQ(genCaptcha());
    setAns("");
    setWrong(false);
    onVerified(false);
  };

  const check = () => {
    if (Number(ans) === q.answer) {
      onVerified(true);
      setWrong(false);
    } else {
      setWrong(true);
      onVerified(false);
    }
  };

  return (
    <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-semibold flex items-center gap-2">
            <ShieldCheck className="size-4 text-brand-primary" /> Human check
          </p>
          <p className="text-xs text-foreground/50 mt-1">Solve the puzzle to continue.</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="text-xs text-foreground/50 hover:text-foreground inline-flex items-center gap-1"
        >
          <RefreshCw className="size-3" /> New puzzle
        </button>
      </div>
      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <div
          className="px-5 py-3 rounded-xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border border-foreground/10 font-mono text-lg font-bold tracking-widest select-none"
          style={{ letterSpacing: "0.35em", textShadow: "0 0 12px rgba(255,255,255,0.15)" }}
        >
          {q.display}
        </div>
        <input
          value={ans}
          onChange={(e) => setAns(e.target.value.replace(/[^\d-]/g, ""))}
          placeholder="Answer"
          className={inputCls + " max-w-[140px]"}
          disabled={verified}
        />
        {!verified ? (
          <button
            type="button"
            onClick={check}
            disabled={!ans}
            className="px-4 py-2 rounded-lg bg-brand-primary text-primary-foreground text-xs font-semibold disabled:opacity-40 cursor-pointer"
          >
            Check
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary">
            <BadgeCheck className="size-4" /> Passed
          </span>
        )}
      </div>
      {wrong && !verified && <p className="mt-2 text-xs text-brand-danger">Not quite — try again.</p>}
      {error && !verified && <p className="mt-2 text-xs text-brand-danger">{error}</p>}
    </div>
  );
}

function genCaptcha() {
  const a = Math.floor(3 + Math.random() * 12);
  const b = Math.floor(2 + Math.random() * 9);
  const op = Math.random() > 0.5 ? "+" : "-";
  const answer = op === "+" ? a + b : a - b;
  return { display: `${a} ${op} ${b} = ?`, answer };
}

// ---------- Step 1: Personal ----------
function Step1Personal({ data, errors, update }: StepProps) {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <Field label="Full name (as on CNIC)" error={errors.fullName} icon={<User className="size-3.5" />}>
        <TextInput value={data.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Ayesha Khan" maxLength={80} />
      </Field>
      <Field label="Father's name" error={errors.fatherName}>
        <TextInput value={data.fatherName} onChange={(e) => update("fatherName", e.target.value)} placeholder="As on CNIC" maxLength={80} />
      </Field>
      <Field label="Mother's name" error={errors.motherName}>
        <TextInput value={data.motherName} onChange={(e) => update("motherName", e.target.value)} placeholder="Mother's maiden name" maxLength={80} />
      </Field>
      <Field label="Date of birth" error={errors.dob}>
        <TextInput type="date" value={data.dob} onChange={(e) => update("dob", e.target.value)} max={new Date().toISOString().slice(0, 10)} />
      </Field>
      <Field label="Gender" error={errors.gender}>
        <SelectInput
          value={data.gender}
          onChange={(v) => update("gender", v)}
          placeholder="Select gender"
          options={[
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Other" },
          ]}
        />
      </Field>
      <Field label="Nationality" error={errors.nationality}>
        <TextInput value={data.nationality} onChange={(e) => update("nationality", e.target.value)} placeholder="Pakistani" maxLength={60} />
      </Field>
      <div className="md:col-span-2">
        <Field label="Place of birth" error={errors.placeOfBirth}>
          <TextInput value={data.placeOfBirth} onChange={(e) => update("placeOfBirth", e.target.value)} placeholder="Karachi" maxLength={80} />
        </Field>
      </div>
    </div>
  );
}

// ---------- Step 2: Identity docs ----------
function Step2Identity({ data, errors, update }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="CNIC issue date" error={errors.cnicIssueDate}>
          <TextInput type="date" value={data.cnicIssueDate} onChange={(e) => update("cnicIssueDate", e.target.value)} />
        </Field>
        <Field label="CNIC expiry date" error={errors.cnicExpiryDate}>
          <TextInput type="date" value={data.cnicExpiryDate} onChange={(e) => update("cnicExpiryDate", e.target.value)} />
        </Field>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <DocumentUpload
          label="CNIC — Front"
          value={data.cnicFront}
          onChange={(v) => update("cnicFront", v)}
          error={errors.cnicFront}
        />
        <DocumentUpload
          label="CNIC — Back"
          value={data.cnicBack}
          onChange={(v) => update("cnicBack", v)}
          error={errors.cnicBack}
        />
      </div>
    </div>
  );
}

function DocumentUpload({
  label, value, onChange, error, accept = "image/*",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      alert("File must be under 5MB");
      return;
    }
    setBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      onChange(String(reader.result || ""));
      setBusy(false);
    };
    reader.readAsDataURL(f);
  };

  return (
    <Field label={label} error={error} icon={<Upload className="size-3.5" />}>
      <div
        className={`rounded-2xl border-2 border-dashed p-4 text-center transition-colors ${
          value ? "border-brand-primary/40 bg-brand-primary/5" : "border-foreground/15 bg-foreground/[0.02] hover:border-foreground/25"
        }`}
      >
        {value ? (
          <div className="relative">
            <img src={value} alt={label} className="max-h-40 mx-auto rounded-lg" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute -top-2 -right-2 size-6 rounded-full bg-brand-danger text-white flex items-center justify-center cursor-pointer"
              aria-label="Remove"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="size-6 mx-auto text-foreground/40" />
            <p className="text-xs text-foreground/50 mt-2">PNG, JPG up to 5MB</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="mt-3 px-4 py-2 rounded-lg bg-foreground/10 hover:bg-foreground/15 text-xs font-semibold cursor-pointer"
            >
              {busy ? "Uploading…" : "Choose file"}
            </button>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>
    </Field>
  );
}

// ---------- Step 3: Address ----------
function Step3Address({ data, errors, update }: StepProps) {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <div className="md:col-span-2">
        <Field label="Street address" error={errors.address} icon={<MapPin className="size-3.5" />}>
          <TextInput value={data.address} onChange={(e) => update("address", e.target.value)} placeholder="House 24, Street 7, F-8/3" maxLength={200} />
        </Field>
      </div>
      <Field label="City" error={errors.city}>
        <TextInput value={data.city} onChange={(e) => update("city", e.target.value)} placeholder="Islamabad" maxLength={60} />
      </Field>
      <Field label="Province" error={errors.province}>
        <SelectInput
          value={data.province}
          onChange={(v) => update("province", v)}
          placeholder="Select province"
          options={[
            { value: "punjab", label: "Punjab" },
            { value: "sindh", label: "Sindh" },
            { value: "kpk", label: "Khyber Pakhtunkhwa" },
            { value: "balochistan", label: "Balochistan" },
            { value: "ict", label: "Islamabad Capital Territory" },
            { value: "gb", label: "Gilgit-Baltistan" },
            { value: "ajk", label: "Azad Jammu & Kashmir" },
          ]}
        />
      </Field>
      <Field label="Postal code" error={errors.postalCode}>
        <TextInput value={data.postalCode} onChange={(e) => update("postalCode", e.target.value)} placeholder="44000" maxLength={12} />
      </Field>
      <Field label="Country" error={errors.country}>
        <TextInput value={data.country} onChange={(e) => update("country", e.target.value)} placeholder="Pakistan" maxLength={60} />
      </Field>
    </div>
  );
}

// ---------- Step 4: Financial ----------
function Step4Financial({ data, errors, update }: StepProps) {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <Field label="Employment status" error={errors.employment} icon={<Briefcase className="size-3.5" />}>
        <SelectInput
          value={data.employment}
          onChange={(v) => update("employment", v)}
          placeholder="Select status"
          options={[
            { value: "employed", label: "Employed" },
            { value: "self-employed", label: "Self-employed / Business owner" },
            { value: "freelancer", label: "Freelancer" },
            { value: "student", label: "Student" },
            { value: "retired", label: "Retired" },
            { value: "housewife", label: "Housewife" },
            { value: "unemployed", label: "Unemployed" },
          ]}
        />
      </Field>
      <Field label="Occupation / Profession" error={errors.occupation}>
        <TextInput value={data.occupation} onChange={(e) => update("occupation", e.target.value)} placeholder="Software Engineer" maxLength={80} />
      </Field>
      <Field label="Employer / Business name" error={errors.employer}>
        <TextInput value={data.employer} onChange={(e) => update("employer", e.target.value)} placeholder="Optional" maxLength={100} />
      </Field>
      <Field label="Annual income (PKR)" error={errors.income}>
        <SelectInput
          value={data.income}
          onChange={(v) => update("income", v)}
          placeholder="Select range"
          options={[
            { value: "<1.5m", label: "Less than ₨ 1,500,000" },
            { value: "1.5m-4.5m", label: "₨ 1,500,000 – ₨ 4,500,000" },
            { value: "4.5m-15m", label: "₨ 4,500,000 – ₨ 15,000,000" },
            { value: "15m+", label: "Over ₨ 15,000,000" },
          ]}
        />
      </Field>
      <Field label="Source of funds" error={errors.sourceOfFunds}>
        <SelectInput
          value={data.sourceOfFunds}
          onChange={(v) => update("sourceOfFunds", v)}
          placeholder="Select source"
          options={[
            { value: "salary", label: "Salary" },
            { value: "business", label: "Business income" },
            { value: "freelance", label: "Freelance / Remittance" },
            { value: "investments", label: "Investments" },
            { value: "savings", label: "Savings" },
            { value: "inheritance", label: "Inheritance / Gift" },
            { value: "other", label: "Other" },
          ]}
        />
      </Field>
      <Field label="Purpose of account" error={errors.purposeOfAccount}>
        <SelectInput
          value={data.purposeOfAccount}
          onChange={(v) => update("purposeOfAccount", v)}
          placeholder="Select purpose"
          options={[
            { value: "salary", label: "Salary crediting" },
            { value: "business", label: "Business operations" },
            { value: "savings", label: "Savings / Investment" },
            { value: "remittance", label: "Receive remittances" },
            { value: "personal", label: "Personal use" },
          ]}
        />
      </Field>
    </div>
  );
}

// ---------- Step 5: Media (live selfie + signature + proof) ----------
function Step5Media({ data, errors, update }: StepProps) {
  const showProof = data.employment === "self-employed" || data.accountType === "freelancer";
  return (
    <div className="space-y-8">
      <LivePhotoCapture value={data.livePhoto} onChange={(v) => update("livePhoto", v)} error={errors.livePhoto} />
      <DocumentUpload
        label="Signature specimen"
        value={data.signature}
        onChange={(v) => update("signature", v)}
        error={errors.signature}
      />
      {showProof && (
        <DocumentUpload
          label="Proof of business / Freelance"
          value={data.proofOfBusiness}
          onChange={(v) => update("proofOfBusiness", v)}
          error={errors.proofOfBusiness}
        />
      )}
    </div>
  );
}

function LivePhotoCapture({
  value, onChange, error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [starting, setStarting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const start = async () => {
    setStarting(true);
    setErrMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
    } catch (e) {
      setErrMsg("Camera access denied. Please allow camera to take a live selfie.");
    } finally {
      setStarting(false);
    }
  };

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setActive(false);
  };

  useEffect(() => () => stop(), []);

  const capture = () => {
    const v = videoRef.current;
    if (!v) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth || 640;
    canvas.height = v.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Mirror to match preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    const url = canvas.toDataURL("image/jpeg", 0.85);
    onChange(url);
    stop();
  };

  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2 flex items-center gap-1.5">
        <Camera className="size-3.5" /> Live selfie (biometric) <span className="text-brand-muted font-normal">— optional</span>
      </span>
      <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-4">
        {value ? (
          <div className="flex items-center gap-4 flex-wrap">
            <img src={value} alt="Live selfie" className="size-32 rounded-xl object-cover border border-brand-primary/40" />
            <div className="flex-1 min-w-[200px]">
              <p className="text-sm font-semibold text-brand-primary flex items-center gap-1.5">
                <BadgeCheck className="size-4" /> Live capture recorded
              </p>
              <p className="text-xs text-foreground/50 mt-1">
                Facial biometric will be matched with your CNIC photo by NADRA Verisys.
              </p>
              <button
                type="button"
                onClick={() => { onChange(""); }}
                className="mt-3 px-3 py-1.5 rounded-lg bg-foreground/10 hover:bg-foreground/15 text-xs cursor-pointer"
              >
                Retake photo
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="relative mx-auto max-w-md rounded-xl overflow-hidden bg-black/40 aspect-[4/3]">
              {active ? (
                <video ref={videoRef} className="w-full h-full object-cover -scale-x-100" playsInline muted />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-foreground/40">
                  <div className="text-center">
                    <ScanFace className="size-10 mx-auto mb-2" />
                    <p className="text-xs">Camera preview will appear here</p>
                  </div>
                </div>
              )}
              {active && (
                <div className="pointer-events-none absolute inset-8 rounded-[45%] border-2 border-brand-primary/60 animate-pulse" />
              )}
            </div>
            <p className="text-[11px] text-foreground/40 mt-3">
              File uploads are disabled for the selfie. Capture must be taken live via camera.
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              {!active ? (
                <button
                  type="button"
                  onClick={start}
                  disabled={starting}
                  className="px-4 py-2 rounded-lg bg-brand-primary text-primary-foreground text-xs font-semibold cursor-pointer inline-flex items-center gap-2"
                >
                  {starting ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
                  {starting ? "Starting camera…" : "Start camera"}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={capture}
                    className="px-4 py-2 rounded-lg bg-brand-primary text-primary-foreground text-xs font-semibold cursor-pointer"
                  >
                    Capture photo
                  </button>
                  <button
                    type="button"
                    onClick={stop}
                    className="px-4 py-2 rounded-lg bg-foreground/10 hover:bg-foreground/15 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
            {errMsg && <p className="mt-2 text-xs text-brand-danger">{errMsg}</p>}
          </div>
        )}
      </div>
      {error && !value && <p className="mt-1.5 text-xs text-brand-danger">{error}</p>}
    </div>
  );
}

// ---------- Step 6: Consents ----------
function Step6Consents({ data, errors, update }: StepProps) {
  return (
    <div className="space-y-4">
      <ConsentRow
        checked={data.termsKfs}
        onChange={(v) => update("termsKfs", v)}
        title="Terms & Conditions and Key Fact Statement (KFS)"
        desc="I have read and accept the account T&Cs, Schedule of Charges, and the Key Fact Statement disclosed to me."
        error={errors.termsKfs}
      />
      <ConsentRow
        checked={data.fatcaCrs}
        onChange={(v) => update("fatcaCrs", v)}
        title="FATCA / CRS declaration"
        desc="I confirm my tax residency status and undertake to disclose any US person / reportable jurisdiction status."
        error={errors.fatcaCrs}
      />
      <ConsentRow
        checked={data.beneficialOwner}
        onChange={(v) => update("beneficialOwner", v)}
        title="Beneficial ownership undertaking"
        desc="I am the ultimate beneficial owner of this account and no third party controls the funds."
        error={errors.beneficialOwner}
      />
      <ConsentRow
        checked={data.zakatExempt}
        onChange={(v) => update("zakatExempt", v)}
        title="Zakat exemption declaration (CZ-50)"
        desc="Optional. Tick only if you wish to file the CZ-50 Zakat exemption declaration on religious grounds."
      />
    </div>
  );
}

function ConsentRow({
  checked, onChange, title, desc, error,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  desc: string;
  error?: string;
}) {
  return (
    <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-colors ${
      checked ? "border-brand-primary/40 bg-brand-primary/5" : "border-foreground/10 bg-foreground/[0.03] hover:bg-foreground/[0.06]"
    }`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 size-4 accent-[var(--brand-primary)]"
      />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-foreground/60 mt-1">{desc}</p>
        {error && <p className="text-xs text-brand-danger mt-2">{error}</p>}
      </div>
    </label>
  );
}

// ---------- Step 7: Review ----------
function Step7Review({ data }: { data: FormData }) {
  const rows: [string, string][] = [
    ["Account type", accountTypes.find((t) => t.id === data.accountType)?.name || "—"],
    ["Full name", data.fullName],
    ["CNIC", data.cnic],
    ["Mobile", data.msisdn],
    ["Email", data.email],
    ["Date of birth", data.dob],
    ["Address", `${data.address}, ${data.city}, ${data.province}`.replace(/^, |, $/g, "")],
    ["Employment", data.employment],
    ["Occupation", data.occupation],
    ["Source of funds", data.sourceOfFunds],
    ["Base currency", data.currency],
  ];
  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground/60">
        Please review your details. By submitting, you authorize Bankislami to verify the information with NADRA, PMD and internal risk systems.
      </p>
      <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] divide-y divide-foreground/5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="text-xs uppercase tracking-wider text-foreground/50">{k}</span>
            <span className="text-sm font-medium text-foreground/90 text-right truncate max-w-[60%]">{v || "—"}</span>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-foreground/40 flex items-center gap-1.5">
        <Lock className="size-3" /> Your data is encrypted in transit (TLS 1.3) and never persisted on this device.
      </p>
    </div>
  );
}

// ---------- Success ----------
function SuccessScreen({ data, trackingId }: { data: FormData; trackingId: string }) {
  const [copied, setCopied] = useState(false);
  const stages = [
    { key: "received", label: "Application Received", desc: "Your Digital AOF has been submitted.", done: true },
    { key: "review", label: "Under Review", desc: "Compliance & risk teams are verifying your details.", done: true, active: true },
    { key: "discrepant", label: "Discrepant (if any)", desc: "You'll be notified if additional info is required.", done: false },
    { key: "operational", label: "Operational", desc: "Account activated and virtual card issued.", done: false },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* noop */ }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mt-10 glass-card rounded-[2.5rem] p-8 md:p-14 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-aurora -z-10" />
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
          className="size-20 mx-auto rounded-3xl bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center mb-6 shadow-glow-primary"
        >
          <ShieldCheck className="size-10 text-brand-primary" />
        </motion.div>
        <h2 className="font-display text-4xl md:text-5xl font-extrabold mb-3">
          Application received
        </h2>
        <p className="text-foreground/60 max-w-md mx-auto mb-6">
          Thanks, <span className="text-foreground font-semibold">{data.fullName.split(" ")[0] || "customer"}</span>.
          We've sent confirmation to{" "}
          <span className="text-foreground font-semibold">{data.email}</span>.
        </p>

        <div className="inline-flex items-center gap-3 rounded-2xl border border-brand-primary/40 bg-brand-primary/10 px-5 py-3 mb-8">
          <span className="text-xs uppercase tracking-widest text-foreground/60">Tracking ID</span>
          <span className="font-mono text-lg font-bold text-brand-primary">{trackingId}</span>
          <button
            type="button"
            onClick={copy}
            className="ml-1 size-8 rounded-lg bg-foreground/10 hover:bg-foreground/15 grid place-items-center cursor-pointer"
            aria-label="Copy tracking id"
          >
            {copied ? <Check className="size-4 text-brand-primary" /> : <Copy className="size-4" />}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        <p className="text-xs uppercase tracking-widest text-foreground/50 mb-3">Application status</p>
        <ol className="relative border-l border-foreground/10 pl-6 space-y-5">
          {stages.map((s, i) => (
            <motion.li
              key={s.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.15 }}
              className="relative"
            >
              <span
                className={`absolute -left-[31px] top-0.5 size-4 rounded-full border-2 ${
                  s.done
                    ? "bg-brand-primary border-brand-primary"
                    : s.active
                    ? "bg-brand-primary/20 border-brand-primary animate-pulse"
                    : "bg-background border-foreground/20"
                }`}
              />
              <p className={`text-sm font-semibold ${s.done || s.active ? "text-foreground" : "text-foreground/40"}`}>
                {s.label}
              </p>
              <p className="text-xs text-foreground/50 mt-0.5">{s.desc}</p>
            </motion.li>
          ))}
        </ol>
      </div>

      <div className="mt-10 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-primary text-primary-foreground font-bold text-sm shadow-glow-primary"
        >
          Back to home <ArrowRight className="size-4" />
        </Link>
      </div>
    </motion.div>
  );
}
