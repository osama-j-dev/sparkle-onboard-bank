import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
} from "lucide-react";

export const Route = createFileRoute("/open-account")({
  component: OpenAccount,
  head: () => ({
    meta: [
      { title: "Open Account — Bankislami" },
      {
        name: "description",
        content:
          "Open your Bankislami account in minutes. Secure, guided, and built for global movement.",
      },
    ],
  }),
});

// ---------- Validation ----------
const cnicRegex = /^\d{5}-\d{7}-\d$/;
const phoneRegex = /^\+?[\d\s-]{10,16}$/;

const schemas = {
  0: z.object({
    fullName: z.string().trim().min(2, "Enter your full name").max(80),
    email: z.string().trim().email("Invalid email").max(255),
    phone: z.string().trim().regex(phoneRegex, "Enter a valid phone number"),
    dob: z.string().min(1, "Date of birth required"),
  }),
  1: z.object({
    cnic: z.string().regex(cnicRegex, "Format: 12345-1234567-1"),
    nationality: z.string().trim().min(2, "Required").max(60),
    gender: z.enum(["male", "female", "other"], { message: "Select one" }),
    motherName: z.string().trim().min(2, "Required").max(80),
  }),
  2: z.object({
    address: z.string().trim().min(5, "Enter address").max(200),
    city: z.string().trim().min(2, "Required").max(60),
    postalCode: z.string().trim().min(3, "Required").max(12),
    country: z.string().trim().min(2, "Required").max(60),
  }),
  3: z.object({
    employment: z.enum(["employed", "self-employed", "student", "unemployed"], {
      message: "Select status",
    }),
    occupation: z.string().trim().min(2, "Required").max(80),
    income: z.enum(["<50k", "50k-150k", "150k-500k", "500k+"], { message: "Select range" }),
    sourceOfFunds: z.enum(["salary", "business", "investments", "savings", "other"], {
      message: "Select source",
    }),
  }),
  4: z.object({
    accountTier: z.enum(["essential", "pro", "elite"], { message: "Choose a tier" }),
    currency: z.enum(["USD", "EUR", "GBP", "PKR"], { message: "Choose currency" }),
    terms: z.literal(true, { message: "You must accept the terms" }),
  }),
} as const;

type FormData = {
  fullName: string; email: string; phone: string; dob: string;
  cnic: string; nationality: string; gender: string; motherName: string;
  address: string; city: string; postalCode: string; country: string;
  employment: string; occupation: string; income: string; sourceOfFunds: string;
  accountTier: string; currency: string; terms: boolean;
};

const initial: FormData = {
  fullName: "", email: "", phone: "", dob: "",
  cnic: "", nationality: "", gender: "", motherName: "",
  address: "", city: "", postalCode: "", country: "",
  employment: "", occupation: "", income: "", sourceOfFunds: "",
  accountTier: "", currency: "", terms: false,
};

const steps = [
  { title: "Personal", icon: User, desc: "Tell us about you" },
  { title: "Identity", icon: IdCard, desc: "Verify who you are" },
  { title: "Address", icon: MapPin, desc: "Where you live" },
  { title: "Financial", icon: Briefcase, desc: "Your background" },
  { title: "Account", icon: Sparkles, desc: "Choose your tier" },
];

function OpenAccount() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<FormData>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const update = (k: keyof FormData, v: string | boolean) => {
    setData((d) => ({ ...d, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const schema = schemas[step as 0 | 1 | 2 | 3 | 4];
    const result = schema.safeParse(data);
    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const issue of result.error.issues) {
        errs[issue.path[0] as string] = issue.message;
      }
      setErrors(errs);
      return false;
    }
    setErrors({});
    return true;
  };

  const next = () => {
    if (!validate()) return;
    if (step === steps.length - 1) {
      setDone(true);
    } else {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };
  const back = () => {
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      {/* Ambient glows */}
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

      {/* Top bar */}
      <nav className="px-6 py-6 max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary shadow-glow-primary" />
          <span className="font-display font-extrabold text-xl tracking-tight">BANKISLAMI</span>
        </Link>
        <Link
          to="/"
          className="text-sm text-foreground/60 hover:text-foreground inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="size-4" /> Back to home
        </Link>
      </nav>

      <main className="px-6 pb-24 max-w-5xl mx-auto">
        {done ? (
          <SuccessScreen data={data} />
        ) : (
          <>
            <Stepper current={step} />
            <div className="mt-10 glass-card rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-aurora opacity-50 -z-10" />
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -60 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <StepHeader step={step} />
                  <div className="mt-8">
                    {step === 0 && <Step0 data={data} errors={errors} update={update} />}
                    {step === 1 && <Step1 data={data} errors={errors} update={update} />}
                    {step === 2 && <Step2 data={data} errors={errors} update={update} />}
                    {step === 3 && <Step3 data={data} errors={errors} update={update} />}
                    {step === 4 && <Step4 data={data} errors={errors} update={update} />}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-10 flex items-center justify-between pt-6 border-t border-white/5">
                <button
                  onClick={back}
                  disabled={step === 0}
                  className="px-5 py-3 rounded-xl text-sm font-semibold text-foreground/70 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="size-4" /> Back
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={next}
                  className="px-7 py-3 rounded-xl bg-brand-primary text-primary-foreground font-bold text-sm cursor-pointer shadow-glow-primary inline-flex items-center gap-2"
                >
                  {step === steps.length - 1 ? "Submit application" : "Continue"}
                  <ArrowRight className="size-4" />
                </motion.button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-between gap-2 md:gap-4 mt-4">
      {steps.map((s, i) => {
        const active = i === current;
        const completed = i < current;
        const Icon = s.icon;
        return (
          <div key={s.title} className="flex-1 flex items-center gap-2 md:gap-4">
            <div className="flex flex-col items-center gap-2 min-w-0">
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
                className={`size-11 md:size-12 rounded-2xl border flex items-center justify-center backdrop-blur-xl ${
                  active || completed ? "border-brand-primary/40" : "border-white/10"
                }`}
              >
                <AnimatePresence mode="wait">
                  {completed ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                    >
                      <Check className="size-5 text-primary-foreground" />
                    </motion.div>
                  ) : (
                    <motion.div key="icon" initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                      <Icon
                        className={`size-5 ${active ? "text-brand-primary" : "text-foreground/40"}`}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              <span
                className={`text-[11px] md:text-xs font-semibold tracking-wide uppercase hidden sm:block ${
                  active ? "text-foreground" : "text-foreground/40"
                }`}
              >
                {s.title}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px bg-white/10 relative overflow-hidden rounded-full">
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
        {s.title} details
      </h2>
      <p className="text-foreground/50 mt-2">{s.desc}</p>
    </div>
  );
}

// ---------- Field primitives ----------
function Field({
  label, error, icon, children,
}: {
  label: string; error?: string; icon?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2 flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      {children}
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
  "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-brand-primary/60 focus:bg-white/[0.07] transition-all";

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls} />;
}

function SelectInput({
  value, onChange, options, placeholder,
}: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder: string;
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
  data: FormData; errors: Record<string, string>;
  update: (k: keyof FormData, v: string | boolean) => void;
};

function Step0({ data, errors, update }: StepProps) {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <Field label="Full name" error={errors.fullName} icon={<User className="size-3.5" />}>
        <TextInput
          value={data.fullName} onChange={(e) => update("fullName", e.target.value)}
          placeholder="Ayesha Khan" maxLength={80}
        />
      </Field>
      <Field label="Email" error={errors.email} icon={<Mail className="size-3.5" />}>
        <TextInput
          type="email" value={data.email} onChange={(e) => update("email", e.target.value)}
          placeholder="you@aurelius.com" maxLength={255}
        />
      </Field>
      <Field label="Phone" error={errors.phone} icon={<Phone className="size-3.5" />}>
        <TextInput
          type="tel" value={data.phone} onChange={(e) => update("phone", e.target.value)}
          placeholder="+92 300 1234567" maxLength={16}
        />
      </Field>
      <Field label="Date of birth" error={errors.dob}>
        <TextInput
          type="date" value={data.dob} onChange={(e) => update("dob", e.target.value)}
        />
      </Field>
    </div>
  );
}

function Step1({ data, errors, update }: StepProps) {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <Field label="CNIC" error={errors.cnic} icon={<IdCard className="size-3.5" />}>
        <TextInput
          value={data.cnic} onChange={(e) => update("cnic", e.target.value)}
          placeholder="12345-1234567-1" maxLength={15}
        />
      </Field>
      <Field label="Nationality" error={errors.nationality}>
        <TextInput
          value={data.nationality} onChange={(e) => update("nationality", e.target.value)}
          placeholder="Pakistani" maxLength={60}
        />
      </Field>
      <Field label="Gender" error={errors.gender}>
        <SelectInput
          value={data.gender} onChange={(v) => update("gender", v)} placeholder="Select gender"
          options={[
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Other" },
          ]}
        />
      </Field>
      <Field label="Mother's name" error={errors.motherName}>
        <TextInput
          value={data.motherName} onChange={(e) => update("motherName", e.target.value)}
          placeholder="As on CNIC" maxLength={80}
        />
      </Field>
    </div>
  );
}

function Step2({ data, errors, update }: StepProps) {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <div className="md:col-span-2">
        <Field label="Street address" error={errors.address} icon={<MapPin className="size-3.5" />}>
          <TextInput
            value={data.address} onChange={(e) => update("address", e.target.value)}
            placeholder="House 24, Street 7, F-8/3" maxLength={200}
          />
        </Field>
      </div>
      <Field label="City" error={errors.city}>
        <TextInput
          value={data.city} onChange={(e) => update("city", e.target.value)}
          placeholder="Islamabad" maxLength={60}
        />
      </Field>
      <Field label="Postal code" error={errors.postalCode}>
        <TextInput
          value={data.postalCode} onChange={(e) => update("postalCode", e.target.value)}
          placeholder="44000" maxLength={12}
        />
      </Field>
      <div className="md:col-span-2">
        <Field label="Country" error={errors.country}>
          <TextInput
            value={data.country} onChange={(e) => update("country", e.target.value)}
            placeholder="Pakistan" maxLength={60}
          />
        </Field>
      </div>
    </div>
  );
}

function Step3({ data, errors, update }: StepProps) {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <Field label="Employment status" error={errors.employment} icon={<Briefcase className="size-3.5" />}>
        <SelectInput
          value={data.employment} onChange={(v) => update("employment", v)}
          placeholder="Select status"
          options={[
            { value: "employed", label: "Employed" },
            { value: "self-employed", label: "Self-employed" },
            { value: "student", label: "Student" },
            { value: "unemployed", label: "Unemployed" },
          ]}
        />
      </Field>
      <Field label="Occupation" error={errors.occupation}>
        <TextInput
          value={data.occupation} onChange={(e) => update("occupation", e.target.value)}
          placeholder="Software Engineer" maxLength={80}
        />
      </Field>
      <Field label="Annual income (USD)" error={errors.income}>
        <SelectInput
          value={data.income} onChange={(v) => update("income", v)} placeholder="Select range"
          options={[
            { value: "<50k", label: "Less than $50,000" },
            { value: "50k-150k", label: "$50,000 – $150,000" },
            { value: "150k-500k", label: "$150,000 – $500,000" },
            { value: "500k+", label: "Over $500,000" },
          ]}
        />
      </Field>
      <Field label="Source of funds" error={errors.sourceOfFunds}>
        <SelectInput
          value={data.sourceOfFunds} onChange={(v) => update("sourceOfFunds", v)}
          placeholder="Select source"
          options={[
            { value: "salary", label: "Salary" },
            { value: "business", label: "Business income" },
            { value: "investments", label: "Investments" },
            { value: "savings", label: "Savings" },
            { value: "other", label: "Other" },
          ]}
        />
      </Field>
    </div>
  );
}

const tiers = [
  { id: "essential", name: "Essential", price: "Free", perks: ["Multi-currency wallet", "Virtual card"] },
  { id: "pro", name: "Pro", price: "$12/mo", perks: ["Physical metal card", "Zero FX fees"] },
  { id: "elite", name: "Elite", price: "$49/mo", perks: ["Concierge", "Priority pass", "Wealth desk"] },
];

function Step4({ data, errors, update }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-3 block">
          Choose your account tier
        </span>
        <div className="grid md:grid-cols-3 gap-4">
          {tiers.map((t) => {
            const active = data.accountTier === t.id;
            return (
              <motion.button
                key={t.id}
                type="button"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => update("accountTier", t.id)}
                className={`text-left p-5 rounded-2xl border transition-all backdrop-blur-xl ${
                  active
                    ? "border-brand-primary bg-brand-primary/10 shadow-glow-primary"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display font-bold text-lg">{t.name}</span>
                  {active && <Check className="size-4 text-brand-primary" />}
                </div>
                <div className="text-2xl font-bold mb-3">{t.price}</div>
                <ul className="space-y-1.5 text-xs text-foreground/60">
                  {t.perks.map((p) => (
                    <li key={p} className="flex items-center gap-1.5">
                      <Check className="size-3 text-brand-primary" /> {p}
                    </li>
                  ))}
                </ul>
              </motion.button>
            );
          })}
        </div>
        {errors.accountTier && (
          <p className="mt-2 text-xs text-brand-danger">{errors.accountTier}</p>
        )}
      </div>

      <Field label="Base currency" error={errors.currency}>
        <SelectInput
          value={data.currency} onChange={(v) => update("currency", v)} placeholder="Select currency"
          options={[
            { value: "USD", label: "USD — US Dollar" },
            { value: "EUR", label: "EUR — Euro" },
            { value: "GBP", label: "GBP — British Pound" },
            { value: "PKR", label: "PKR — Pakistani Rupee" },
          ]}
        />
      </Field>

      <label className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer hover:bg-white/[0.05] transition-colors">
        <input
          type="checkbox"
          checked={data.terms}
          onChange={(e) => update("terms", e.target.checked)}
          className="mt-1 size-4 accent-[var(--brand-primary)]"
        />
        <span className="text-sm text-foreground/70">
          I confirm the information is accurate and accept the{" "}
          <a href="#" className="text-brand-primary underline-offset-2 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-brand-primary underline-offset-2 hover:underline">
            Privacy Policy
          </a>
          .
        </span>
      </label>
      {errors.terms && <p className="text-xs text-brand-danger">{errors.terms}</p>}
    </div>
  );
}

function SuccessScreen({ data }: { data: FormData }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mt-16 glass-card rounded-[2.5rem] p-12 md:p-16 text-center relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-aurora -z-10" />
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
        className="size-20 mx-auto rounded-3xl bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center mb-8 shadow-glow-primary"
      >
        <ShieldCheck className="size-10 text-brand-primary" />
      </motion.div>
      <h2 className="font-display text-4xl md:text-5xl font-extrabold mb-4">
        Application received
      </h2>
      <p className="text-foreground/60 max-w-md mx-auto mb-8">
        Thanks, <span className="text-foreground font-semibold">{data.fullName.split(" ")[0]}</span>.
        We've sent a confirmation to{" "}
        <span className="text-foreground font-semibold">{data.email}</span>. Your virtual card is
        being provisioned now.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-primary text-primary-foreground font-bold text-sm shadow-glow-primary"
      >
        Back to home <ArrowRight className="size-4" />
      </Link>
    </motion.div>
  );
}
