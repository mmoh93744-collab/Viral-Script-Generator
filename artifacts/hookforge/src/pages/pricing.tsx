import { useState, useEffect, useRef, useCallback } from "react";
import {
  Zap,
  Hash,
  BarChart3,
  Sparkles,
  Infinity,
  ShieldCheck,
  Users,
  Clock,
  Star,
  CheckCircle2,
  Crown,
  Rocket,
  X,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Confetti
───────────────────────────────────────────── */
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: "rect" | "circle";
}

function useConfetti() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  const launch = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const colors = ["#FF4500", "#FFC439", "#FF6B35", "#fff", "#FFD700", "#FF8C00"];
    const count = 120;
    const cx = canvas.width / 2;
    const cy = canvas.height * 0.35;
    particlesRef.current = Array.from({ length: count }, () => ({
      x: cx + (Math.random() - 0.5) * 40,
      y: cy,
      vx: (Math.random() - 0.5) * 14,
      vy: -(Math.random() * 10 + 6),
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      opacity: 1,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    }));

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particlesRef.current) {
        p.vy += 0.35;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.012;
        if (p.opacity <= 0) continue;
        alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      }
      if (alive) rafRef.current = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(draw);
  }, []);

  return { canvasRef, launch };
}

/* ─────────────────────────────────────────────
   Floating Particles Background
───────────────────────────────────────────── */
function FloatingParticles() {
  const count = 30;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => {
        const size = Math.random() * 4 + 2;
        const left = Math.random() * 100;
        const delay = Math.random() * 8;
        const duration = Math.random() * 6 + 6;
        const opacity = Math.random() * 0.4 + 0.1;
        return (
          <span
            key={i}
            className="absolute rounded-full bg-primary"
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              bottom: "-10px",
              opacity,
              animation: `float-up ${duration}s ${delay}s ease-in infinite`,
            }}
          />
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Countdown Timer
───────────────────────────────────────────── */
function useCountdown(totalSeconds: number) {
  const [remaining, setRemaining] = useState(totalSeconds);
  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((s) => (s <= 1 ? totalSeconds : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [totalSeconds]);
  const m = String(Math.floor(remaining / 60)).padStart(2, "0");
  const s = String(remaining % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function CountdownBadge() {
  const time = useCountdown(203);
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-sm font-bold text-primary animate-pulse">
      <Clock className="w-4 h-4" />
      Next viral script generated in: {time}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Feature Card
───────────────────────────────────────────── */
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  detail: string;
  delay?: number;
}

function FeatureCard({ icon, title, description, detail, delay = 0 }: FeatureCardProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative rounded-2xl border border-border bg-card p-6 overflow-hidden cursor-default"
      style={{
        transition: "transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
        transform: hovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
        borderColor: hovered ? "hsl(16 100% 50% / 0.5)" : undefined,
        boxShadow: hovered ? "0 12px 40px hsl(16 100% 50% / 0.12)" : undefined,
        animationDelay: `${delay}ms`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Glow overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent pointer-events-none"
        style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.25s ease" }}
      />

      <div
        className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mb-4"
        style={{
          transition: "background-color 0.2s ease, transform 0.2s ease",
          backgroundColor: hovered ? "hsl(16 100% 50% / 0.25)" : undefined,
          transform: hovered ? "scale(1.1)" : undefined,
        }}
      >
        <span className="text-primary">{icon}</span>
      </div>

      <h3 className="font-black text-white text-lg mb-1">{title}</h3>
      <p
        className="text-muted-foreground text-sm leading-relaxed"
        style={{ transition: "opacity 0.2s ease", opacity: hovered ? 0 : 1 }}
      >
        {description}
      </p>
      <p
        className="absolute bottom-6 left-6 right-6 text-sm text-primary/90 leading-relaxed"
        style={{
          transition: "opacity 0.2s ease, transform 0.2s ease",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateY(0)" : "translateY(6px)",
        }}
      >
        {detail}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Pricing Page
───────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <Infinity className="w-5 h-5" />,
    title: "Unlimited Viral Scripts",
    description: "Generate as many Shorts scripts as you want — no daily limits, no waiting.",
    detail: "💡 Pro creators post 3–5 Shorts per day. Limits kill momentum. You need unlimited.",
  },
  {
    icon: <Hash className="w-5 h-5" />,
    title: "SEO & Hashtags Ready",
    description: "Every script comes with an optimized title, description, and 8 trending hashtags.",
    detail: "📈 The right hashtags can 10x your discoverability. We research them so you don't have to.",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "AI Performance Prediction",
    description: "Know your estimated 24h and 7-day views before you even record.",
    detail: "🔮 Our AI benchmarks your script against millions of viral videos before you post.",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Competitor Analyzer",
    description: "Paste any YouTube URL and get a full breakdown + improved viral script.",
    detail: "🕵️ Spy on what's working, then make it better. All in under 30 seconds.",
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "Interactive AI UI",
    description: "A beautifully designed dashboard built for creators, not developers.",
    detail: "✨ No learning curve. Open HookForge, enter your idea, hit generate. Done.",
  },
];

const PERKS = [
  "Unlimited script generation",
  "Competitor video analyzer",
  "SEO title & description",
  "8 trending hashtags per script",
  "Performance predictions",
  "3 alternative script versions",
  "Cancel anytime — no contracts",
];

export default function Pricing() {
  const { canvasRef, launch } = useConfetti();
  const [clicked, setClicked] = useState(false);
  const [spotsLeft] = useState(47);

  const handleSubscribe = () => {
    launch();
    setClicked(true);
    setTimeout(() => {
      window.open("https://www.paypal.com/ncp/payment/FXKFKNT7GK4R4", "_blank", "noopener,noreferrer");
    }, 400);
  };

  return (
    <div className="w-full flex flex-col items-center pb-20">

      {/* Canvas for confetti — overlays the whole page */}
      <canvas
        ref={(el) => {
          (canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current = el;
          if (el) {
            el.width = el.offsetWidth || window.innerWidth;
            el.height = el.offsetHeight || window.innerHeight;
          }
        }}
        className="fixed inset-0 w-full h-full pointer-events-none z-50"
        aria-hidden="true"
      />

      {/* ── Hero ─────────────────────────────── */}
      <div className="relative w-full max-w-3xl text-center py-10 px-4 overflow-hidden animate-fade-in-up">
        <FloatingParticles />

        {/* Radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative">
          {/* Limited badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-orange-500/40 bg-orange-500/10 text-orange-400 text-xs font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            Only {spotsLeft} spots left this month
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white leading-tight">
            Unlock Unlimited Viral Scripts<br />
            <span className="text-primary">for Just $6/Month 🚀</span>
          </h1>

          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8 font-medium">
            Generate scripts instantly, with SEO &amp; Hashtags ready, and AI performance predictions — no limits.
          </p>

          <CountdownBadge />
        </div>
      </div>

      {/* ── Pricing Card ─────────────────────── */}
      <div className="w-full max-w-md px-4 mb-12 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <div className="relative rounded-3xl border border-primary/30 bg-card overflow-hidden shadow-2xl">
          {/* Top gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-orange-400 to-primary" />

          {/* Crown badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
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
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-8">Launch price — Cancel anytime</p>

            {/* Perks */}
            <ul className="text-left space-y-3 mb-8">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-medium text-foreground">{perk}</span>
                </li>
              ))}
            </ul>

            {/* Subscribe CTA */}
            <div className="relative">
              <div
                className="absolute -inset-1 rounded-2xl blur-lg opacity-60 transition-all duration-300"
                style={{
                  background: "linear-gradient(90deg, #FF4500, #FF8C00, #FF4500)",
                  backgroundSize: "200%",
                  animation: "shimmer-bg 3s linear infinite",
                }}
              />
              <button
                onClick={handleSubscribe}
                className="relative w-full flex items-center justify-center gap-3 bg-primary text-white font-black text-lg rounded-xl py-5 transition-all duration-200 hover:scale-[1.03] hover:bg-orange-500 active:scale-[0.98]"
                style={{ boxShadow: "0 0 30px hsl(16 100% 50% / 0.4)" }}
              >
                <Rocket className="w-5 h-5" />
                Subscribe Now – $6 Only 💸
                {clicked && <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: "1s" }} />}
              </button>
            </div>

            {/* Trust */}
            <div className="flex items-center justify-center gap-4 mt-5 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-muted-foreground font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Secure payment
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground font-semibold">
                <X className="w-3.5 h-3.5 text-muted-foreground" /> No hidden fees
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Features ─────────────────────────── */}
      <div className="w-full max-w-3xl px-4 mb-12">
        <h2 className="text-2xl font-black text-white text-center mb-2">Everything you need to go viral</h2>
        <p className="text-muted-foreground text-center text-sm mb-8 font-medium">Hover each card to learn more</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 80} />
          ))}
        </div>
      </div>

      {/* ── Social Proof ─────────────────────── */}
      <div className="w-full max-w-2xl px-4 mb-12">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: <Users className="w-5 h-5" />, label: "Trusted by", value: "1,000+ Creators" },
            { icon: <Star className="w-5 h-5" />, label: "Average rating", value: "4.9 / 5 ⭐" },
            { icon: <Zap className="w-5 h-5" />, label: "Scripts generated", value: "50,000+" },
          ].map((s) => (
            <div
              key={s.label}
              className="analysis-card bg-card border border-border rounded-2xl p-5 text-center"
            >
              <span className="text-primary mb-2 flex justify-center">{s.icon}</span>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{s.label}</p>
              <p className="text-white font-black text-lg">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Testimonials ─────────────────────── */}
      <div className="w-full max-w-3xl px-4 mb-12">
        <h2 className="text-2xl font-black text-white text-center mb-6">Creators love HookForge</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              name: "Marcus T.",
              handle: "@marcusmakes",
              quote: "I went from 2k to 40k views per Short in 3 weeks. The hook generator is insane.",
              stars: 5,
            },
            {
              name: "Alicia V.",
              handle: "@aliciacreates",
              quote: "The competitor analyzer is scary good. I paste a rival's URL and it spits out something 10x better.",
              stars: 5,
            },
            {
              name: "DeShawn K.",
              handle: "@deshawnviral",
              quote: "$6/month is nothing. I made that back in my first monetized Short.",
              stars: 5,
            },
          ].map((t) => (
            <div key={t.name} className="analysis-card bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
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
      </div>

      {/* ── Bottom CTA ───────────────────────── */}
      <div className="w-full max-w-xl px-4 text-center animate-fade-in-up">
        <p className="text-muted-foreground text-sm font-medium mb-4">
          Join 1,000+ creators already dominating YouTube Shorts
        </p>
        <button
          onClick={handleSubscribe}
          className="btn-glow w-full flex items-center justify-center gap-2 bg-primary text-white font-black text-lg rounded-2xl py-5 hover:bg-orange-500 transition-colors"
        >
          <Crown className="w-5 h-5" />
          Start Creating for $6/Month 🔥
        </button>
        <p className="text-xs text-muted-foreground mt-3 font-medium">
          Secure payment via PayPal · Cancel anytime · No hidden fees
        </p>
      </div>

      <style>{`
        @keyframes float-up {
          0%   { transform: translateY(0) scale(1); opacity: 0.6; }
          100% { transform: translateY(-120vh) scale(0.5); opacity: 0; }
        }
        @keyframes shimmer-bg {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </div>
  );
}
