import { useState } from "react";
import { useGenerateScript } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Zap, Lock, RefreshCw, AlertCircle, Search, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { GeneratedScript } from "@workspace/api-client-react";
import Analyzer from "@/pages/analyzer";
import Pricing from "@/pages/pricing";

type Tab = "generate" | "analyze" | "pro";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("generate");

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-primary/30">

      {/* Header / Hero */}
      <div className="w-full max-w-3xl flex flex-col items-center text-center mb-10 animate-fade-in-up">
        <div className="inline-flex items-center justify-center space-x-2 mb-6 bg-card px-4 py-2 rounded-full border border-border shadow-sm">
          <Zap className="w-5 h-5 text-primary" />
          <span className="font-bold tracking-tight text-lg">HookForge</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-white leading-tight">
          Hammer raw ideas into <span className="text-primary">viral gold.</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto font-medium">
          Generate viral Shorts scripts or analyze any competitor video — in seconds.
        </p>
      </div>

      {/* Tabs */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex bg-card border border-border rounded-xl p-1 gap-1">
          <button
            onClick={() => setActiveTab("generate")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
              activeTab === "generate"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Generate
          </button>
          <button
            onClick={() => setActiveTab("analyze")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
              activeTab === "analyze"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Search className="w-4 h-4" />
            Analyze
          </button>
          <button
            onClick={() => setActiveTab("pro")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
              activeTab === "pro"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Crown className="w-4 h-4" />
            Go Pro 💸
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "generate" && <Generator />}
      {activeTab === "analyze" && <Analyzer />}
      {activeTab === "pro" && <Pricing />}
    </div>
  );
}

function Generator() {
  const [topic, setTopic] = useState("");
  const [script, setScript] = useState<GeneratedScript | null>(null);
  const [remainingRequests, setRemainingRequests] = useState(2);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const { toast } = useToast();

  const generateMutation = useGenerateScript({
    mutation: {
      onSuccess: (data: any) => {
        setScript({
          hook: data.hook,
          body: data.body,
          cta: data.cta,
        });
        const newRemaining = data.remainingRequests !== undefined
          ? data.remainingRequests
          : Math.max(0, remainingRequests - 1);
        setRemainingRequests(newRemaining);
        if (newRemaining === 0 || data.isLimitReached) setIsLimitReached(true);
      },
      onError: (error: any) => {
        if (error.status === 429 || error?.data?.error === "FREE_LIMIT_REACHED") {
          setIsLimitReached(true);
          setRemainingRequests(0);
          toast({ title: "Limit Reached", description: "You've used all your free scripts for today.", variant: "destructive" });
          return;
        }
        toast({ title: "Generation failed", description: "Failed to forge your script. Please try again.", variant: "destructive" });
      },
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLimitReached) return;
    setScript(null);
    generateMutation.mutate({ data: { topic } });
  };

  return (
    <>
      {/* Input */}
      <div className="w-full max-w-2xl mb-8 animate-fade-in-up">
        <form onSubmit={handleGenerate} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-primary/0 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
          <div className="relative flex flex-col sm:flex-row gap-3 bg-card p-2 rounded-xl border border-border shadow-xl">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. The #1 mistake new YouTubers make"
              className="flex-1 border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 px-4 h-14"
              disabled={generateMutation.isPending || isLimitReached}
            />
            <Button
              type="submit"
              size="lg"
              className="h-14 px-8 text-base font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={!topic.trim() || generateMutation.isPending || isLimitReached}
            >
              {generateMutation.isPending ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Forging...</>
              ) : (
                <><Sparkles className="w-5 h-5 mr-2" /> Generate Script</>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-4 flex flex-col items-center gap-3">
          <div className="flex justify-center items-center text-sm text-muted-foreground font-medium">
            {!isLimitReached ? (
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                {remainingRequests} free {remainingRequests === 1 ? "script" : "scripts"} remaining today
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

      {/* Results */}
      {script && (
        <div className="w-full max-w-3xl flex flex-col gap-6 animate-fade-in-up">
          <div className="grid gap-6">
            <Card className="bg-card border-border overflow-hidden relative border-l-4 border-l-primary shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <CardContent className="p-6 sm:p-8 pt-10 relative">
                <Badge className="absolute top-4 left-4 sm:left-8 bg-primary/20 text-primary hover:bg-primary/30 border-none font-bold px-3 py-1">
                  HOOK (1-3s)
                </Badge>
                <p className="text-2xl sm:text-3xl font-black text-white leading-tight mt-4">{script.hook}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border overflow-hidden relative shadow-md">
              <CardContent className="p-6 sm:p-8 pt-10 relative">
                <Badge variant="outline" className="absolute top-4 left-4 sm:left-8 text-muted-foreground border-border font-bold px-3 py-1">
                  BODY (8-10s)
                </Badge>
                <p className="text-lg text-card-foreground leading-relaxed mt-4 whitespace-pre-wrap font-medium">{script.body}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border overflow-hidden relative shadow-md">
              <CardContent className="p-6 sm:p-8 pt-10 relative">
                <Badge variant="outline" className="absolute top-4 left-4 sm:left-8 text-muted-foreground border-border font-bold px-3 py-1">
                  CTA (2-3s)
                </Badge>
                <p className="text-xl font-bold text-white mt-4">{script.cta}</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col items-center gap-4 mt-4 pt-6 border-t border-border/50">
            {!isLimitReached && (
              <Button variant="outline" onClick={() => { setScript(null); setTopic(""); }} className="font-bold">
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate Another
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Upgrade Banner */}
      {isLimitReached && (
        <div className="w-full max-w-2xl mt-12 animate-fade-in-up">
          <div className="rounded-2xl p-1 bg-gradient-to-br from-primary/40 via-primary/10 to-transparent">
            <div className="bg-card rounded-xl p-8 text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-black mb-2 text-white">Unlock Unlimited Forging</h3>
              <p className="text-muted-foreground mb-6 font-medium max-w-md">
                You've hit the daily limit. Upgrade to Pro for unlimited scripts and competitor analyses.
              </p>
              <Button size="lg" className="w-full sm:w-auto px-8 font-bold text-base" asChild>
                <a href="https://www.paypal.com/ncp/payment/FXKFKNT7GK4R4" target="_blank" rel="noopener noreferrer">
                  Unlock Unlimited — $19/mo
                </a>
              </Button>
              {script && (
                <Button variant="ghost" disabled className="mt-4 font-bold opacity-50">
                  <Lock className="w-4 h-4 mr-2" />
                  Generate Another
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
