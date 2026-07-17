import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  ShieldCheck,
  Globe2,
  Zap,
  ScanFace,
  Layers,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Lock,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import heroCard from "@/assets/hero-card.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Bankislami — Open a premium account in 3 minutes" },
      {
        name: "description",
        content:
          "Bankislami is next-generation banking. Open a premium account in 3 minutes — no borders, no hidden fees, pure digital movement.",
      },
      { property: "og:title", content: "Bankislami — Banking for the unbounded" },
      {
        property: "og:description",
        content: "Open a premium global account in 3 minutes.",
      },
    ],
  }),
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-brand-primary/30 overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[140px] animate-drift"
          style={{ background: "color-mix(in oklab, var(--brand-primary) 14%, transparent)" }} />
        <div className="absolute top-[40%] -right-[10%] w-[55%] h-[55%] rounded-full blur-[140px] animate-drift"
          style={{ background: "color-mix(in oklab, var(--brand-secondary) 14%, transparent)", animationDelay: "-6s" }} />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full blur-[140px] animate-drift"
          style={{ background: "color-mix(in oklab, var(--brand-primary) 8%, transparent)", animationDelay: "-12s" }} />
      </div>

      <Nav />
      <Hero />
      <TrustBar />
      <Steps />
      <Features />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <nav className="fixed top-0 w-full z-50 px-6 py-4">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-7xl mx-auto flex items-center justify-between glass-pill px-6 py-3 rounded-full"
      >
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary shadow-glow-primary" />
          <span className="font-display font-extrabold text-xl tracking-tight">BANKISLAMI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
          {["Personal", "Business", "Treasury", "Wealth"].map((l) => (
            <a key={l} href="#" className="hover:text-brand-primary transition-colors">{l}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/open-account" className="bg-foreground text-background px-5 py-2 rounded-full text-sm font-semibold hover:bg-brand-primary transition-all cursor-pointer">
            Open Account
          </Link>
        </div>
      </motion.div>
    </nav>
  );
}

function Hero() {
  return (
    <main className="relative pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
        >
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-wider mb-6"
          >
            <span className="size-2 rounded-full bg-brand-primary animate-pulse" />
            Next-Gen Banking
          </motion.div>
          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="font-display text-6xl lg:text-8xl font-extrabold leading-[1.05] mb-8 text-balance"
          >
            Finance for the <span className="text-gradient-brand">Unbounded.</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-xl text-white/60 max-w-lg mb-10 leading-relaxed"
          >
            Open a premium global account in 3 minutes. No borders, no hidden
            fees, just pure digital movement.
          </motion.p>
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-wrap gap-4"
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/open-account"
                className="px-8 py-4 rounded-2xl bg-brand-primary text-primary-foreground font-bold text-lg cursor-pointer shadow-glow-primary inline-flex items-center gap-2"
              >
                Start Application <ArrowRight className="size-5" />
              </Link>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-8 py-4 rounded-2xl glass-card font-bold text-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              View Features
            </motion.button>
          </motion.div>
        </motion.div>

        <HeroCard />
      </div>
    </main>
  );
}

function HeroCard() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-aurora" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
        className="relative animate-float"
      >
        <div className="glass-card p-8 rounded-[2.5rem] shadow-glass relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1">
                Available Balance
              </p>
              <h3 className="text-4xl font-display font-bold">₨ 34,944,140</h3>
            </div>
            <div className="size-12 rounded-full border border-white/20 flex items-center justify-center">
              <CreditCard className="size-5 text-brand-primary" />
            </div>
          </div>

          <div className="w-full aspect-[1.6/1] rounded-2xl mb-8 overflow-hidden border border-white/10">
            <img
              src={heroCard}
              alt="Bankislami glass card preview"
              width={1024}
              height={640}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <Tx
              icon={<TrendingDown className="size-4" />}
              tint="bg-brand-secondary/20 text-brand-secondary"
              title="Cloud Compute Inc."
              sub="Subscription"
              amount="-₨ 83,720"
              amountClass="text-brand-danger"
            />
            <Tx
              icon={<TrendingUp className="size-4" />}
              tint="bg-brand-primary/20 text-brand-primary"
              title="Global Equity Div"
              sub="Dividend"
              amount="+₨ 397,600"
              amountClass="text-brand-primary"
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="absolute -bottom-6 -left-6 lg:-left-12 glass-card p-5 rounded-3xl z-20 shadow-glass max-w-[210px]"
        >
          <p className="text-[10px] uppercase text-white/40 font-bold mb-2 tracking-widest">
            Security Status
          </p>
          <div className="flex items-center gap-3">
            <div className="size-3 rounded-full bg-brand-success animate-pulse" />
            <span className="text-sm font-semibold">Active Shield</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function Tx({
  icon, tint, title, sub, amount, amountClass,
}: {
  icon: React.ReactNode; tint: string; title: string; sub: string; amount: string; amountClass: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
      <div className="flex items-center gap-3">
        <div className={`size-10 rounded-full flex items-center justify-center ${tint}`}>{icon}</div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-white/40">{sub}</p>
        </div>
      </div>
      <span className={`font-medium ${amountClass}`}>{amount}</span>
    </div>
  );
}

function TrustBar() {
  const names = ["FORTUNA", "VERTEX", "ORION", "NOVA", "ZENITH"];
  return (
    <section className="py-12 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-center gap-8 opacity-50">
        {names.map((n) => (
          <span key={n} className="font-display font-black text-2xl tracking-tight">{n}</span>
        ))}
      </div>
    </section>
  );
}

const steps = [
  {
    icon: ScanFace,
    title: "Verify Identity",
    body: "Snap a photo of your ID. Our AI processes verification instantly with 99.9% accuracy.",
    tint: "bg-brand-primary/10 text-brand-primary",
  },
  {
    icon: Layers,
    title: "Select Tier",
    body: "Choose between Essential, Pro, or Elite tiers based on your global spending needs.",
    tint: "bg-brand-secondary/10 text-brand-secondary",
  },
  {
    icon: Sparkles,
    title: "Instant Access",
    body: "Receive your virtual card immediately and start spending while your physical card ships.",
    tint: "bg-white/10 text-foreground",
  },
];

function Steps() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight">
            Start your journey in seconds
          </h2>
          <p className="text-white/50">The future of banking is frictionless.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="glass-card p-10 rounded-[2rem] hover:bg-white/[0.05] transition-all group"
            >
              <div className={`size-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform ${s.tint}`}>
                <s.icon className="size-6" />
              </div>
              <div className="text-xs font-mono text-white/30 mb-2">0{i + 1}</div>
              <h3 className="text-xl font-bold mb-4">{s.title}</h3>
              <p className="text-white/50 leading-relaxed">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: Zap, title: "Instant Settlement", body: "Sub-second transfers across 140 countries, day or night." },
  { icon: ShieldCheck, title: "Hardware-grade Security", body: "End-to-end encryption with biometric and FIDO2 hardware keys." },
  { icon: Globe2, title: "Zero FX Fees", body: "Spend like a local with real-time interbank conversion rates." },
  { icon: Lock, title: "Sovereign Privacy", body: "Your data never leaves our private rail. Audited annually." },
];

function Features() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-16 max-w-2xl"
        >
          Built on principles that <span className="text-gradient-brand">don't bend.</span>
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass-card p-8 rounded-3xl hover:bg-white/[0.05] transition-all"
            >
              <div className="size-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-6">
                <f.icon className="size-6" />
              </div>
              <h4 className="font-bold mb-2">{f.title}</h4>
              <p className="text-sm text-white/50 leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-32 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="relative max-w-5xl mx-auto glass-card rounded-[2.5rem] p-12 md:p-20 text-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-aurora -z-10" />
        <h2 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Your account is <span className="text-gradient-brand">3 minutes away.</span>
        </h2>
        <p className="text-lg text-white/60 max-w-xl mx-auto mb-10">
          Join 240,000+ members banking on the new rail.
        </p>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="inline-block">
          <Link
            to="/open-account"
            className="px-10 py-4 rounded-2xl bg-brand-primary text-primary-foreground font-bold text-lg cursor-pointer shadow-glow-primary inline-flex items-center gap-2"
          >
            Open my account <ArrowRight className="size-5" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-md bg-gradient-to-br from-brand-primary to-brand-secondary" />
          <span className="font-display font-extrabold tracking-tight">BANKISLAMI</span>
        </div>
        <p className="text-xs text-white/40">
          © 2026 Bankislami Financial. Banking services via Bankislami Trust Partners.
        </p>
        <div className="flex gap-6 text-xs text-white/50">
          <a href="#" className="hover:text-brand-primary">Privacy</a>
          <a href="#" className="hover:text-brand-primary">Terms</a>
          <a href="#" className="hover:text-brand-primary">Security</a>
        </div>
      </div>
    </footer>
  );
}
