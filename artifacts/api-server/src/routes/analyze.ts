import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { AnalyzeVideoBody } from "@workspace/api-zod";

const router: IRouter = Router();

const FREE_LIMIT = 2;
const requestCounts = new Map<string, number>();

router.post("/analyze", async (req, res): Promise<void> => {
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "unknown";

  const count = requestCounts.get(ip) ?? 0;

  if (count >= FREE_LIMIT) {
    res.status(429).json({ error: "FREE_LIMIT_REACHED" });
    return;
  }

  const parsed = AnalyzeVideoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { url } = parsed.data;

  const isYouTube =
    url.includes("youtube.com") || url.includes("youtu.be");
  if (!isYouTube) {
    res.status(400).json({ error: "Please provide a valid YouTube video URL." });
    return;
  }

  const systemPrompt = `You are an elite viral video strategist who has studied millions of YouTube Shorts and TikToks. 
You analyze competitor videos and generate dramatically improved, ready-to-publish scripts.

Given a YouTube URL, you will:
1. Infer the video's topic from the URL structure (video ID, channel, playlist, or any readable slugs)
2. Generate a comprehensive, professional analysis AS IF you had watched the video, making intelligent assumptions about typical content for that topic/channel
3. Create an improved viral script that outperforms the original

Output ONLY valid JSON with no markdown, no code blocks, no extra text. Exactly this structure:
{
  "topic": "inferred topic in 5-10 words",
  "video_analysis": {
    "hook_analysis": "Why the first 3 seconds grab viewers — what pattern interrupt or curiosity trigger is used",
    "structure": "Key scenes and video structure breakdown: opening, middle, end, transitions",
    "strengths": "What makes this video successful — specific techniques, pacing, emotion",
    "weaknesses": "Concrete weaknesses: what's missing, what loses viewers, what could be stronger"
  },
  "improved_script": {
    "hook": "A dramatically stronger hook that pattern interrupts in 0-3 seconds",
    "intro": "The opening 3-5 seconds of dialogue/narration verbatim",
    "main_content": "The full middle section of the script with scene directions",
    "cta": "A high-converting, specific call-to-action with urgency",
    "style": "One of: funny / shocking / educational / challenge / story",
    "additional_scenes": "2-3 specific additional scenes or edits that would boost retention"
  },
  "seo": {
    "title": "Viral-optimized title under 60 characters with power words",
    "description": "2-3 sentence catchy description with keywords naturally embedded",
    "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5", "#hashtag6", "#hashtag7", "#hashtag8"]
  },
  "performance_estimate": {
    "views_24h": "realistic range like '8,000 - 25,000'",
    "views_7d": "realistic range like '50,000 - 180,000'",
    "retention_score": "percentage like '68%'",
    "virality_score": "score like '7.8/10'"
  },
  "multiple_versions": [
    {
      "style": "Story-driven",
      "hook": "Hook specific to this style",
      "script": "Full 15-second script verbatim for this style version",
      "why_it_works": "1-2 sentences on why this version drives retention"
    },
    {
      "style": "Shocking/Controversial",
      "hook": "Hook specific to this style",
      "script": "Full 15-second script verbatim for this style version",
      "why_it_works": "1-2 sentences on why this version drives retention"
    },
    {
      "style": "Educational/How-To",
      "hook": "Hook specific to this style",
      "script": "Full 15-second script verbatim for this style version",
      "why_it_works": "1-2 sentences on why this version drives retention"
    }
  ]
}`;

  const userPrompt = `Analyze this YouTube video and generate the full viral improvement package: ${url}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 2000,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "";

  let result: object;
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    result = JSON.parse(jsonMatch[0]);
  } catch {
    req.log.error({ raw }, "Failed to parse AI analyze response");
    res.status(500).json({ error: "Failed to parse AI response. Please try again." });
    return;
  }

  requestCounts.set(ip, count + 1);
  const remainingRequests = FREE_LIMIT - (count + 1);

  res.json({ ...result, remainingRequests, isLimitReached: remainingRequests <= 0 });
});

export default router;
