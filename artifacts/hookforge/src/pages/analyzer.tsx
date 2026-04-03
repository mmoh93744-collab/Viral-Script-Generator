import { useState } from "react";
import { useAnalyzeVideo } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Search,
  AlertCircle,
  TrendingUp,
  Zap,
  Target,
  BarChart3,
  Hash,
  FileText,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-primary">{icon}</span>
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{label}</h3>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-3 border-b border-border/40 last:border-0">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground min-w-36">{label}</span>
      <span className="text-sm text-foreground leading-relaxed">{value}</span>
    </div>
  );
}

function VersionCard({ version, index }: { version: AnalysisResult["multiple_versions"][0]; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <Badge className="bg-primary/20 text-primary border-none font-bold text-xs">V{index + 1}</Badge>
          <span className="font-bold text-white text-sm">{version.style}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-border/40 space-y-4">
          <div className="pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Hook</p>
            <p className="text-white font-black text-lg leading-tight">{version.hook}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Full Script</p>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-background/60 rounded-lg p-3 border border-border/40">{version.script}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Why It Works</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{version.why_it_works}</p>
          </div>
        </div>
      )}
    </div>
  );
}

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

      {/* Input */}
      <div className="w-full max-w-2xl mb-8">
        <form onSubmit={handleAnalyze} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-primary/0 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
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
              className="h-14 px-8 text-base font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={!url.trim() || analyzeMutation.isPending || isLimitReached}
            >
              {analyzeMutation.isPending ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing...</>
              ) : (
                <><Search className="w-5 h-5 mr-2" /> Analyze Video</>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-4 flex flex-col items-center gap-3">
          <div className="flex justify-center items-center text-sm text-muted-foreground font-medium">
            {!isLimitReached ? (
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                {remainingRequests} free {remainingRequests === 1 ? "analysis" : "analyses"} remaining today
              </span>
            ) : (
              <span className="flex items-center text-destructive">
                <AlertCircle className="w-4 h-4 mr-1.5" />
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

      {/* Loading shimmer */}
      {analyzeMutation.isPending && (
        <div className="w-full max-w-3xl space-y-4 animate-pulse">
          {[120, 180, 140, 100].map((h, i) => (
            <div key={i} className="rounded-xl bg-card border border-border" style={{ height: h }} />
          ))}
        </div>
      )}

      {/* Results */}
      {result && !analyzeMutation.isPending && (
        <div className="w-full max-w-3xl space-y-5 animate-fade-in-up">

          {/* Topic banner */}
          <div className="rounded-xl bg-primary/10 border border-primary/20 px-6 py-4 flex items-center gap-3">
            <Zap className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-0.5">Analyzed Topic</p>
              <p className="text-white font-bold text-sm">{result.topic}</p>
            </div>
          </div>

          {/* Performance stats */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <SectionHeader icon={<BarChart3 className="w-4 h-4" />} label="Performance Estimate" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "24h Views", value: result.performance_estimate.views_24h },
                  { label: "7 Day Views", value: result.performance_estimate.views_7d },
                  { label: "Retention", value: result.performance_estimate.retention_score },
                  { label: "Virality", value: result.performance_estimate.virality_score },
                ].map((stat) => (
                  <div key={stat.label} className="bg-background/60 rounded-lg p-4 text-center border border-border/40">
                    <p className="text-primary font-black text-xl leading-none mb-1">{stat.value}</p>
                    <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Video Analysis */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <SectionHeader icon={<Eye className="w-4 h-4" />} label="Video Analysis" />
              <div className="divide-y divide-border/40">
                <DataRow label="Hook (0-3s)" value={result.video_analysis.hook_analysis} />
                <DataRow label="Structure" value={result.video_analysis.structure} />
                <DataRow label="Strengths" value={result.video_analysis.strengths} />
                <DataRow label="Weaknesses" value={result.video_analysis.weaknesses} />
              </div>
            </CardContent>
          </Card>

          {/* Improved Script */}
          <Card className="bg-card border-border border-l-4 border-l-primary">
            <CardContent className="p-6">
              <SectionHeader icon={<FileText className="w-4 h-4" />} label="Improved Script" />
              <div className="mb-4 flex items-center gap-2">
                <Badge className="bg-primary/20 text-primary border-none font-bold">Style: {result.improved_script.style}</Badge>
              </div>
              <div className="space-y-4">
                <div className="bg-background/60 rounded-lg p-4 border border-border/40">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Hook (0-3s)</p>
                  <p className="text-white font-black text-2xl leading-tight">{result.improved_script.hook}</p>
                </div>
                <div className="bg-background/60 rounded-lg p-4 border border-border/40">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Intro</p>
                  <p className="text-sm text-foreground leading-relaxed">{result.improved_script.intro}</p>
                </div>
                <div className="bg-background/60 rounded-lg p-4 border border-border/40">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Main Content</p>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{result.improved_script.main_content}</p>
                </div>
                <div className="bg-background/60 rounded-lg p-4 border border-border/40">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Call to Action</p>
                  <p className="text-sm font-bold text-white">{result.improved_script.cta}</p>
                </div>
                <div className="bg-background/60 rounded-lg p-4 border border-border/40">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Additional Scenes</p>
                  <p className="text-sm text-foreground leading-relaxed">{result.improved_script.additional_scenes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <SectionHeader icon={<TrendingUp className="w-4 h-4" />} label="SEO Optimization" />
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Title</p>
                  <p className="text-white font-bold text-base">{result.seo.title}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Description</p>
                  <p className="text-sm text-foreground leading-relaxed">{result.seo.description}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                    <Hash className="w-3 h-3" />Hashtags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.seo.hashtags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs font-semibold text-primary border-primary/30 bg-primary/5">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3 Versions */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <SectionHeader icon={<Target className="w-4 h-4" />} label="3 Alternative Versions" />
              <div className="space-y-3">
                {result.multiple_versions.map((v, i) => (
                  <VersionCard key={i} version={v} index={i} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upgrade if limit reached */}
          {isLimitReached && (
            <div className="rounded-2xl p-1 bg-gradient-to-br from-primary/40 via-primary/10 to-transparent">
              <div className="bg-card rounded-xl p-8 text-center flex flex-col items-center">
                <h3 className="text-xl font-black mb-2 text-white">Unlock Unlimited Analyses</h3>
                <p className="text-muted-foreground mb-5 font-medium text-sm max-w-md">
                  You've used all your free analyses. Upgrade to Pro for unlimited competitor video breakdowns.
                </p>
                <Button size="lg" className="font-bold" asChild>
                  <a href="https://www.paypal.com/ncp/payment/FXKFKNT7GK4R4" target="_blank" rel="noopener noreferrer">
                    Unlock Unlimited — $19/mo
                  </a>
                </Button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
