import { useState, useEffect, useRef, useCallback } from "react";
import {
  Zap, Hash, BarChart3, Sparkles, Infinity,
  ShieldCheck, Users, Clock, Star,
  CheckCircle2, Crown, Rocket, X,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Lightweight Confetti — canvas, runs once
───────────────────────────────────────────── */
const CONF_COLORS = ["#FF4500","#FFC439","#FF8C00","#fff","#FFD700"];

function useConfetti() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef    = useRef(0);

  const launch = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    type P = { x:number;y:number;vx:number;vy:number;col:string;sz:number;rot:number;rs:number;op:number };
    const ps: P[] = Array.from({ length: 80 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 60,
      y: canvas.height * 0.38,
      vx: (Math.random() - 0.5) * 13,
      vy: -(Math.random() * 9 + 5),
      col: CONF_COLORS[Math.floor(Math.random() * CONF_COLORS.length)],
      sz: Math.random() * 8 + 3,
      rot: Math.random() * 360,
      rs: (Math.random() - 0.5) * 8,
      op: 1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let any = false;
      for (const p of ps) {
        p.vy += 0.38; p.vx *= 0.99;
        p.x += p.vx; p.y += p.vy;
        p.rot += p.rs; p.op -= 0.013;
        if (p.op <= 0) continue;
        any = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.op);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.col;
        ctx.fillRect(-p.sz / 2, -p.sz / 4, p.sz, p.sz / 2);
        ctx.restore();
      }
      if (any) rafRef.current = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(draw);
  }, []);

  return { canvasRef, launch };
}

/* ─────────────────────────────────────────────
   IntersectionObserver reveal hook
───────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add("visible"); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ─────────────────────────────────────────────
   Countdown Timer
───────────────────────────────────────────── */
function useCountdown(total: number) {
  const [rem, setRem] = useState(total);
  useEffect(() => {
    const id = setInterval(() => setRem((s) => (s <= 1 ? total : s - 1)), 1000);
    return () => clearInterval(id);
  }, [total]);
  return `${String(Math.floor(rem / 60)).padStart(2, "0")}:${String(rem % 60).padStart(2, "0")}`;
}

function CountdownBadge() {
  const t = useCountdown(203);
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-sm font-bold text-primary">
      <Clock className="w-4 h-4 shrink-0" />
      Next viral script generated in:&nbsp;<span className="tabular-nums">{t}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Pure-CSS Floating Particles (no JS loop)
───────────────────────────────────────────── */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i / 18) * 100 + (Math.random() * 5 - 2.5)}%`,
  size: Math.random() * 4 + 2,
  dur: `${Math.random() * 7 + 7}s`,
  delay: `${Math.random() * 8}s`,
  op: Math.random() * 0.35 + 0.08,
}));

function CSSParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: p.left,
            bottom: 0,
            width: p.size,
            height: p.size,
            "--dur": p.dur,
            "--delay": p.delay,
            "--op": p.op,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   CSS Sparkles around CTA (no JS)
───────────────────────────────────────────── */
const SPARKLE_DEFS = [
  { sx: "10px",  sy: "-16px", sd: "2.2s", ss: "0s"    },
  { sx: "-12px", sy: "-12px", sd: "2.6s", ss: "0.4s"  },
  { sx: "16px",  sy: "-8px",  sd: "2.0s", ss: "0.8s"  },
  { sx: "-8px",  sy: "-18px", sd: "2.8s", ss: "0.2s"  },
  { sx: "0px",   sy: "-20px", sd: "2.4s", ss: "1.0s"  },
  { sx: "-16px", sy: "-6px",  sd: "2.1s", ss: "0.6s"  },
];

function CTASparkles() {
  return (
    <>
      {SPARKLE_DEFS.map((s, i) => (
        <span
          key={i}
          className="sparkle"
          style={{ "--sx": s.sx, "--sy": s.sy, "--sd": s.sd, "--ss": s.ss } as React.CSSProperties}
        />
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
const FEATURES = [
  {
    Icon: Infinity,
    title: "Unlimited Viral Scripts",
    desc: "Generate as many Shorts scripts as you want — no daily limits, no waiting.",
    tip: "💡 Pro creators post 3–5 Shorts per day. Limits kill momentum — you need unlimited.",
  },
  {
    Icon: Hash,
    title: "SEO & Hashtags Ready",
    desc: "Every script ships with an optimized title, description, and 8 trending hashtags.",
    tip: "📈 The right hashtags 10x your discoverability. We research them so you don't have to.",
  },
  {
    Icon: BarChart3,
    title: "Performance Predictions",
    desc: "Know your estimated 24h and 7-day views before you even hit record.",
    tip: "🔮 Your script is benchmarked against millions of viral videos before you post.",
  },
  {
    Icon: Zap,
    title: "Competitor Analyzer",
    desc: "Paste any YouTube URL and get a full breakdown + improved viral script.",
    tip: "🕵️ Spy on what's working, then make it 10x better — in under 30 seconds.",
  },
  {
    Icon: Sparkles,
    title: "Interactive AI UI",
    desc: "A beautifully designed dashboard built for creators, not developers.",
    tip: "✨ No learning curve. Open HookForge, enter an idea, hit generate. Done.",
  },
];

const PERKS = [
  "Unlimited script generation",
  "Competitor video analyzer",
  "SEO title & description",
  "8 trending hashtags per script",
  "AI performance predictions",
  "3 alternative script versions",
  "Cancel anytime — no contracts",
];

const STATS = [
  { Icon: Users,  label: "Trusted by",        value: "1,000+ Creators" },
  { Icon: Star,   label: "Average rating",    value: "4.9 / 5 ⭐"       },
  { Icon: Zap,    label: "Scripts generated", value: "50,000+"          },
];

const TESTIMONIALS = [
  { name: "Marcus T.",   handle: "@marcusmakes",    quote: "I went from 2k to 40k views per Short in 3 weeks. The hook generator is insane." },
  { name: "Alicia V.",   handle: "@aliciacreates",  quote: "The competitor analyzer is scary good. Paste a rival's URL — it spits out something 10x better." },
  { name: "DeShawn K.",  handle: "@deshawnviral",   quote: "$6/month is nothing. I made that back in my very first monetized Short." },
];

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function Pricing() {
  const { canvasRef, launch } = useConfetti();
  const [burst, setBurst] = useState(false);
  useReveal();

  const handleSubscribe = () => {
    launch();
    setBurst(true);
    setTimeout(() => window.open("https://www.paypal.com/ncp/payment/FXKFKNT7GK4R4", "_blank", "noopener,noreferrer"), 350);
    setTimeout(() => setBurst(false), 2400);
  };

  return (
    <div className="w-full flex flex-col items-center pb-24">

      {/* Confetti canvas — fixed, pointer-events-none */}
      <canvas
        ref={(el) => { (canvasRef as React.MutableRefObject<HTMLCanvasElement|null>).current = el; }}
        className="fixed inset-0 w-full h-full pointer-events-none z-50"
        aria-hidden="true"
      />

      {/* ── HERO ─────────────────────────────── */}
      <section className="relative w-full max-w-3xl text-center py-10 px-4 overflow-hidden">
        <CSSParticles />

        {/* Radial glow — CSS only, no JS */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[640px] h-[260px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, hsl(16 100% 50% / 0.12) 0%, transparent 70%)" }}
          aria-hidden="true"
        />

        <div className="relative animate-fade-in-up">
          {/* Scarcity badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-orange-500/35 bg-orange-500/8 text-orange-400 text-xs font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" aria-hidden="true" />
            Only 47 spots left this month
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white leading-tight">
            Unlock Unlimited Viral Scripts<br />
            <span className="text-primary">for Just $6/Month 🚀</span>
          </h1>

          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8 font-medium">
            Generate scripts instantly, with SEO-ready titles, hashtags, and AI performance predictions.
          </p>

          <CountdownBadge />
        </div>
      </section>

      {/* ── PRICING CARD ─────────────────────── */}
      <section className="reveal w-full max-w-md px-4 mb-14">
        <div className="relative rounded-3xl border border-primary/30 bg-card shadow-2xl overflow-hidden">
          {/* Animated shimmer bar on top */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{
              background: "linear-gradient(90deg, hsl(16 100% 50%), hsl(35 100% 55%), hsl(16 100% 50%))",
              backgroundSize: "300% 100%",
              animation: "shimmer-bar 3s linear infinite",
            }}
          />

          {/* Best value badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <div className="flex items-center gap-1.5 bg-primary text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg">
              <Crown className="w-3.5 h-3.5" />
              BEST VALUE
            </div>
          </div>

          <div className="p-8 pt-10 text-center">
            {/* Price */}
            <div className="flex items-end justify-center gap-1 mb-1">
              <span className="text-muted-foreground text-base font-semibold line-through mr-2">$19</span>
              <span className="text-6xl font-black text-white leading-none">$6</span>
              <span className="text-muted-foreground font-semibold mb-2">/month</span>
            </div>
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-8">Launch price · Cancel anytime</p>

            {/* Perks */}
            <ul className="text-left space-y-3 mb-8">
              {PERKS.map((p) => (
                <li key={p} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-medium text-foreground">{p}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="relative inline-block w-full">
              <button
                onClick={handleSubscribe}
                className="cta-subscribe w-full flex items-center justify-center gap-3 text-lg rounded-xl py-5"
              >
                <Rocket className="w-5 h-5 shrink-0" />
                Subscribe Now – $6 Only 💸
                {burst && <Sparkles className="w-5 h-5 shrink-0" style={{ animation: "spin 1s linear infinite" }} />}
                <CTASparkles />
              </button>
            </div>

            {/* Trust micro-badges */}
            <div className="flex items-center justify-center gap-4 mt-5 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-muted-foreground font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Secure payment
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground font-semibold">
                <X className="w-3.5 h-3.5" /> No hidden fees
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────── */}
      <section className="reveal w-full max-w-3xl px-4 mb-14">
        <h2 className="text-2xl font-black text-white text-center mb-1">Everything you need to go viral</h2>
        <p className="text-muted-foreground text-center text-sm mb-8 font-medium">Hover each card to reveal a creator tip</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ Icon, title, desc, tip }, i) => (
            <div
              key={title}
              className="feature-card rounded-2xl border border-border bg-card p-6"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              {/* Hover overlay */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 transition-opacity duration-200"
                style={{ background: "radial-gradient(circle at 50% 50%, hsl(16 100% 50% / 0.06), transparent 70%)" }}
              />
              <div className="card-icon w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-black text-white text-base mb-2">{title}</h3>
              <p className="card-desc text-muted-foreground text-sm leading-relaxed">{desc}</p>
              <p className="card-tip">{tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ────────────────────────────── */}
      <section className="reveal w-full max-w-2xl px-4 mb-14">
        <div className="grid sm:grid-cols-3 gap-4">
          {STATS.map(({ Icon, label, value }) => (
            <div key={label} className="stat-card bg-card border border-border rounded-2xl p-5 text-center">
              <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
              <p className="text-white font-black text-lg">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────── */}
      <section className="reveal w-full max-w-3xl px-4 mb-14">
        <h2 className="text-2xl font-black text-white text-center mb-6">Creators love HookForge</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className="testi-card bg-card border border-border rounded-2xl p-5 flex flex-col gap-3"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed flex-1">"{t.quote}"</p>
              <div>
                <p className="text-sm font-bold text-white">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.handle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────── */}
      <section className="reveal w-full max-w-xl px-4 text-center">
        <p className="text-muted-foreground text-sm font-medium mb-4">
          Join 1,000+ creators already dominating YouTube Shorts
        </p>
        <div className="relative inline-block w-full">
          <button
            onClick={handleSubscribe}
            className="cta-subscribe w-full flex items-center justify-center gap-2 text-lg rounded-2xl py-5"
          >
            <Crown className="w-5 h-5 shrink-0" />
            Start Creating for $6/Month 🔥
            <CTASparkles />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-3 font-medium">
          Secure payment via PayPal · Cancel anytime · No hidden fees
        </p>
      </section>
    </div>
  );
}
