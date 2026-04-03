import { useState, useEffect, useRef } from "react";
import { useAnalyzeVideo } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  AlertCircle,
  TrendingUp,
  Zap,
  Target,
  BarChart3,
  Hash,
  FileText,
  Eye,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Rocket,
  Crown,
  Sparkles,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  Clapperboard,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface AnalysisResult {
  topic: string;
  video_analysis: {
    hook_analysis: string;
    structure: string;
    strengths: string;
    weaknesses: string;
  };
  improved_script: {
    hook: string;
    intro: string;
    main_content: string;
    cta: string;
    style: string;
    additional_scenes: string;
  };
  seo: {
    title: string;
    description: string;
    hashtags: string[];
  };
  performance_estimate: {
    views_24h: string;
    views_7d: string;
    retention_score: string;
    virality_score: string;
  };
  multiple_versions: Array<{
    style: string;
    hook: string;
    script: string;
    why_it_works: string;
  }>;
  remainingRequests?: number;
  isLimitReached?: boolean;
}

/* ─────────────────────────────────────────────
   Animated Loading Sequence
───────────────────────────────────────────── */
const LOAD_STEPS = [
  { label: "Scanning video structure…", pct: 15 },
  { label: "Analyzing hook effectiveness…", pct: 32 },
  { label: "Measuring retention signals…", pct: 50 },
  { label: "Computing viral potential…", pct: 68 },
  { label: "Generating improved script…", pct: 82 },
  { label: "Unlocking viral secrets 🔍", pct: 96 },
];

function AnalyzingLoader() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s < LOAD_STEPS.length - 1 ? s + 1 : s));
    }, 1400);
    return () => clearInterval(id);
  }, []);

  const current = LOAD_STEPS[step];

  return (
    <div className="w-full max-w-xl mx-auto my-10 animate-fade-in-up">
      {/* Scanner box */}
      <div className="relative rounded-2xl overflow-hidden border border-primary/20 bg-card mb-6" style={{ height: 140 }}>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        {/* Scan line */}
        <div
          className="scan-line absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
          style={{ top: "10%" }}
        />
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary animate-spin" style={{ animationDuration: "3s" }} />
            <span className="font-black text-white text-base tracking-tight">AI Analysis in Progress</span>
            <Sparkles className="w-5 h-5 text-primary animate-spin" style={{ animationDuration: "3s", animationDirection: "reverse" }} />
          </div>
          <p className="text-sm text-muted-foreground font-medium transition-all" key={step}>
            {current.label}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-border overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-700 ease-out"
          style={{ width: `${current.pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground font-semibold">
        <span>Analyzing…</span>
        <span>{current.pct}%</span>
      </div>

      {/* Shimmer skeletons */}
      <div className="mt-8 space-y-3">
        {[80, 56, 100, 64].map((h, i) => (
          <div
            key={i}
            className="skeleton-shimmer rounded-xl"
            style={{ height: h, animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Copy Button
───────────────────────────────────────────── */
function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all duration-200 ${
        copied
          ? "copy-flash text-primary border-primary/50"
          : "text-muted-foreground border-border hover:text-foreground hover:border-primary/30"
      }`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : label}
    </button>
  );
}

/* ─────────────────────────────────────────────
   Performance Meters
───────────────────────────────────────────── */
function parsePct(val: string): number {
  const match = val.match(/(\d+)/);
  return match ? Math.min(parseInt(match[1]), 100) : 50;
}
function parseScore(val: string): number {
  const match = val.match(/([\d.]+)\s*\/\s*10/);
  return match ? Math.min(parseFloat(match[1]) * 10, 100) : 70;
}

function MeterBar({ value, color = "from-primary to-orange-400", delay = 0 }: { value: number; color?: string; delay?: number }) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div ref={ref} className="h-2 rounded-full bg-border overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`}
        style={{ width: animated ? `${value}%` : "0%" }}
      />
    </div>
  );
}

interface PerfStatProps {
  label: string;
  value: string;
  barValue: number;
  icon: React.ReactNode;
  delay?: number;
}

function PerfStat({ label, value, barValue, icon, delay = 0 }: PerfStatProps) {
  return (
    <div className="analysis-card bg-background/60 rounded-xl p-4 border border-border/40 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
        </div>
        <span className="text-primary font-black text-base leading-none" style={{ animation: "count-up 0.6s ease-out forwards", animationDelay: `${delay}ms` }}>
          {value}
        </span>
      </div>
      <MeterBar value={barValue} delay={delay} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Analysis Cards (hover reveal)
───────────────────────────────────────────── */
interface AnalysisCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  tip?: string;
  color?: string;
}
function AnalysisCard({ icon, title, value, tip, color = "border-border/40" }: AnalysisCardProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`analysis-card rounded-xl border ${color} bg-background/60 p-4 relative overflow-hidden cursor-default`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-primary">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</span>
      </div>
      <p className={`text-sm text-foreground leading-relaxed transition-all duration-300 ${hovered && tip ? "opacity-0 translate-y-1" : "opacity-100"}`}>
        {value}
      </p>
      {tip && (
        <p className={`absolute inset-4 top-8 text-sm text-primary/90 leading-relaxed transition-all duration-300 ${hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
          💡 {tip}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Version Carousel
───────────────────────────────────────────── */
function VersionCarousel({ versions }: { versions: AnalysisResult["multiple_versions"] }) {
  const [active, setActive] = useState(0);
  const v = versions[active];

  const fullScript = `HOOK:\n${v.hook}\n\nSCRIPT:\n${v.script}`;

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {versions.map((ver, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
              active === i
                ? "bg-primary text-white border-primary shadow-md"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {ver.style}
          </button>
        ))}
      </div>

      {/* Card */}
      <div className="carousel-card rounded-xl border border-border bg-background/60 p-5 space-y-4" key={active}>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1.5">Hook</p>
          <p className="text-white font-black text-xl leading-tight">{v.hook}</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Script</p>
            <CopyButton text={fullScript} label="Copy Script" />
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-card rounded-lg p-3 border border-border/40">{v.script}</p>
        </div>

        <div className="flex items-start gap-2 bg-primary/5 border border-primary/20 rounded-lg p-3">
          <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground/80 leading-relaxed">{v.why_it_works}</p>
        </div>
      </div>

      {/* Prev/Next */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setActive((a) => Math.max(0, a - 1))}
          disabled={active === 0}
          className="flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>
        <div className="flex gap-1.5">
          {versions.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-2 h-2 rounded-full transition-all ${active === i ? "bg-primary w-5" : "bg-border hover:bg-muted-foreground"}`}
            />
          ))}
        </div>
        <button
          onClick={() => setActive((a) => Math.min(versions.length - 1, a + 1))}
          disabled={active === versions.length - 1}
          className="flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Section Header
───────────────────────────────────────────── */
function SectionHeader({ icon, label, badge }: { icon: React.ReactNode; label: string; badge?: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="text-primary">{icon}</span>
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{label}</h3>
      {badge && <Badge className="bg-primary/20 text-primary border-none font-bold text-xs ml-auto">{badge}</Badge>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function Analyzer() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [remainingRequests, setRemainingRequests] = useState(2);
  const { toast } = useToast();

  const analyzeMutation = useAnalyzeVideo({
    mutation: {
      onSuccess: (data: any) => {
        setResult(data);
        if (data.remainingRequests !== undefined) {
          setRemainingRequests(data.remainingRequests);
          if (data.isLimitReached) setIsLimitReached(true);
        }
      },
      onError: (error: any) => {
        if (error.status === 429 || error?.data?.error === "FREE_LIMIT_REACHED") {
          setIsLimitReached(true);
          setRemainingRequests(0);
          toast({ title: "Limit reached", description: "Upgrade to Pro for unlimited analyses.", variant: "destructive" });
          return;
        }
        if (error.status === 400) {
          toast({ title: "Invalid URL", description: error?.data?.error || "Please enter a valid YouTube URL.", variant: "destructive" });
          return;
        }
        toast({ title: "Analysis failed", description: "Something went wrong. Please try again.", variant: "destructive" });
      },
    },
  });

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLimitReached) return;
    setResult(null);
    analyzeMutation.mutate({ data: { url: url.trim() } });
  };

  return (
    <div className="w-full flex flex-col items-center">

      {/* URL Input */}
      <div className="w-full max-w-2xl mb-6">
        <form onSubmit={handleAnalyze} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-primary/0 rounded-xl blur opacity-30 group-hover:opacity-70 transition duration-500" />
          <div className="relative flex flex-col sm:flex-row gap-3 bg-card p-2 rounded-xl border border-border shadow-xl">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/shorts/..."
              className="flex-1 border-0 bg-transparent text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 px-4 h-14"
              disabled={analyzeMutation.isPending || isLimitReached}
            />
            <Button
              type="submit"
              size="lg"
              className="h-14 px-8 text-base font-bold btn-glow"
              disabled={!url.trim() || analyzeMutation.isPending || isLimitReached}
            >
              {analyzeMutation.isPending ? (
                <><Sparkles className="w-5 h-5 mr-2 animate-spin" style={{ animationDuration: "2s" }} /> Analyzing…</>
              ) : (
                <><Search className="w-5 h-5 mr-2" /> Analyze Video</>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-4 flex flex-col items-center gap-3">
          <div className="text-sm text-muted-foreground font-medium">
            {!isLimitReached ? (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {remainingRequests} free {remainingRequests === 1 ? "analysis" : "analyses"} remaining
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-destructive">
                <AlertCircle className="w-4 h-4" />
                Free limit reached
              </span>
            )}
          </div>

          <a
            href="https://www.paypal.com/ncp/payment/FXKFKNT7GK4R4"
            target="_blank"
            rel="noopener noreferrer"
            className="paypal-btn"
          >
            <span className="paypal-logo" aria-hidden="true">
              <span style={{ color: "#003087" }}>Pay</span><span style={{ color: "#009cde" }}>Pal</span>
            </span>
            Pay with PayPal — Unlock Unlimited
          </a>
        </div>
      </div>

      {/* Loading state */}
      {analyzeMutation.isPending && <AnalyzingLoader />}

      {/* Results */}
      {result && !analyzeMutation.isPending && (
        <div className="w-full max-w-3xl space-y-5 animate-fade-in-up">

          {/* Topic Banner */}
          <div className="rounded-xl bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/25 px-6 py-4 flex items-center gap-3">
            <Zap className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary/80 mb-0.5">Analyzed Topic</p>
              <p className="text-white font-bold text-sm">{result.topic}</p>
            </div>
          </div>

          {/* Performance Estimates */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <SectionHeader icon={<BarChart3 className="w-4 h-4" />} label="Performance Estimate" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PerfStat
                  label="Views in 24h"
                  value={result.performance_estimate.views_24h}
                  barValue={40}
                  icon={<TrendingUp className="w-4 h-4" />}
                  delay={0}
                />
                <PerfStat
                  label="Views in 7 Days"
                  value={result.performance_estimate.views_7d}
                  barValue={65}
                  icon={<TrendingUp className="w-4 h-4" />}
                  delay={150}
                />
                <PerfStat
                  label="Viewer Retention"
                  value={result.performance_estimate.retention_score}
                  barValue={parsePct(result.performance_estimate.retention_score)}
                  icon={<Eye className="w-4 h-4" />}
                  delay={300}
                />
                <PerfStat
                  label="Virality Score"
                  value={result.performance_estimate.virality_score}
                  barValue={parseScore(result.performance_estimate.virality_score)}
                  icon={<Zap className="w-4 h-4" />}
                  delay={450}
                />
              </div>
            </CardContent>
          </Card>

          {/* Video Analysis */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <SectionHeader icon={<Eye className="w-4 h-4" />} label="Video Analysis" />
              <div className="grid sm:grid-cols-2 gap-3">
                <AnalysisCard
                  icon={<Zap className="w-3.5 h-3.5" />}
                  title="Hook (0-3s)"
                  value={result.video_analysis.hook_analysis}
                  tip="A strong hook must trigger curiosity or emotion in under 2 seconds."
                  color="border-primary/20"
                />
                <AnalysisCard
                  icon={<Clapperboard className="w-3.5 h-3.5" />}
                  title="Structure"
                  value={result.video_analysis.structure}
                  tip="Hover for tip: tight cuts every 2-3s keep mobile viewers engaged."
                />
                <AnalysisCard
                  icon={<ThumbsUp className="w-3.5 h-3.5" />}
                  title="Strengths"
                  value={result.video_analysis.strengths}
                  tip="Double down on what's already working — amplify, don't replace."
                />
                <AnalysisCard
                  icon={<ThumbsDown className="w-3.5 h-3.5" />}
                  title="Weaknesses"
                  value={result.video_analysis.weaknesses}
                  tip="Fixing even one major weakness can 2x your retention score."
                />
              </div>
            </CardContent>
          </Card>

          {/* Improved Script */}
          <Card className="bg-card border-border border-l-4 border-l-primary">
            <CardContent className="p-6">
              <SectionHeader
                icon={<FileText className="w-4 h-4" />}
                label="Improved Viral Script"
                badge={`Style: ${result.improved_script.style}`}
              />

              {/* Hook spotlight */}
              <div className="relative rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/25 p-5 mb-4 overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -translate-y-8 translate-x-8 blur-xl" />
                <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">⚡ Hook (0-3s)</p>
                <p className="text-white font-black text-2xl leading-tight">{result.improved_script.hook}</p>
                <div className="mt-3 flex justify-end">
                  <CopyButton text={result.improved_script.hook} label="Copy Hook" />
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Intro", value: result.improved_script.intro },
                  { label: "Main Content", value: result.improved_script.main_content },
                  { label: "Additional Scenes", value: result.improved_script.additional_scenes },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-background/60 rounded-lg p-4 border border-border/40">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                      <CopyButton text={value} />
                    </div>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{value}</p>
                  </div>
                ))}

                {/* CTA with glow */}
                <div className="relative">
                  <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-primary/40 to-orange-500/20 blur-sm" />
                  <div className="relative bg-card rounded-xl p-4 border border-primary/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-primary">📣 Call To Action</p>
                      <CopyButton text={result.improved_script.cta} />
                    </div>
                    <p className="text-base font-black text-white">{result.improved_script.cta}</p>
                  </div>
                </div>
              </div>

              {/* Copy & Post CTA */}
              <div className="mt-6">
                <button
                  onClick={() => {
                    const full = `HOOK:\n${result.improved_script.hook}\n\nINTRO:\n${result.improved_script.intro}\n\nMAIN:\n${result.improved_script.main_content}\n\nCTA:\n${result.improved_script.cta}`;
                    navigator.clipboard.writeText(full).catch(() => {});
                    toast({ title: "Script copied!", description: "Full script copied to clipboard. Time to post! 🚀" });
                  }}
                  className="btn-glow w-full flex items-center justify-center gap-2 bg-primary text-white font-black text-base rounded-xl py-4 hover:bg-orange-500 transition-colors"
                >
                  <Rocket className="w-5 h-5" />
                  Copy Full Script &amp; Post 🚀
                </button>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <SectionHeader icon={<TrendingUp className="w-4 h-4" />} label="SEO Optimization" />

              <div className="space-y-4">
                <div className="analysis-card bg-background/60 rounded-xl p-4 border border-border/40">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</p>
                    <CopyButton text={result.seo.title} />
                  </div>
                  <p className="text-white font-bold text-base">{result.seo.title}</p>
                </div>

                <div className="analysis-card bg-background/60 rounded-xl p-4 border border-border/40">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</p>
                    <CopyButton text={result.seo.description} />
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{result.seo.description}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Hash className="w-3 h-3" /> Hashtags
                    </p>
                    <CopyButton text={result.seo.hashtags.join(" ")} label="Copy All" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.seo.hashtags.map((tag, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          navigator.clipboard.writeText(tag).catch(() => {});
                          toast({ title: "Copied!", description: tag });
                        }}
                        className="text-xs font-semibold text-primary border border-primary/30 bg-primary/5 hover:bg-primary/15 hover:border-primary/50 rounded-full px-3 py-1 transition-all duration-150 active:scale-95"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3 Alternative Versions */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <SectionHeader icon={<Target className="w-4 h-4" />} label="3 Alternative Versions" badge="Carousel" />
              <VersionCarousel versions={result.multiple_versions} />
            </CardContent>
          </Card>

          {/* Upgrade banner */}
          {isLimitReached && (
            <div className="rounded-2xl p-px bg-gradient-to-br from-primary/50 via-orange-500/20 to-transparent">
              <div className="bg-card rounded-2xl p-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-black mb-2 text-white">Unlock Unlimited Analyses</h3>
                <p className="text-muted-foreground mb-5 font-medium text-sm max-w-md">
                  You've used your free analyses. Go Pro for unlimited competitor breakdowns and never run out of inspiration.
                </p>
                <a
                  href="https://www.paypal.com/ncp/payment/FXKFKNT7GK4R4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-glow inline-flex items-center gap-2 bg-primary text-white font-black text-base rounded-xl px-8 py-4 hover:bg-orange-500 transition-colors"
                >
                  <Crown className="w-5 h-5" />
                  Unlock VIP — $19/mo 💰
                </a>
                <div className="flex items-center gap-1.5 mt-4 text-xs text-muted-foreground font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                  Secure payment via PayPal
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
