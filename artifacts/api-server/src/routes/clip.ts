import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { ClipAnalyzeBody } from "@workspace/api-zod";

const router: IRouter = Router();
const FREE_LIMIT = 2;
const clipCounts = new Map<string, number>();

router.post("/clip-analyze", async (req, res): Promise<void> => {
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "unknown";

  const count = clipCounts.get(ip) ?? 0;
  if (count >= FREE_LIMIT) {
    res.status(429).json({ error: "FREE_LIMIT_REACHED" });
    return;
  }

  const parsed = ClipAnalyzeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { url, platform } = parsed.data;
  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be") || url.includes("youtu");
  const isValid = isYouTube || url.includes("tiktok.com") || url.includes("instagram.com") || url.startsWith("http");

  if (!isValid) {
    res.status(400).json({ error: "Please provide a valid video URL (YouTube, TikTok, or Instagram)." });
    return;
  }

  const targetPlatform = platform || "TikTok, YouTube Shorts, and Instagram Reels";

  const systemPrompt = `You are an elite short-form video strategist specializing in viral content repurposing.

Given a video URL, analyze the URL structure to infer the topic/niche, then generate a complete clip strategy as if you had watched the full video.

Generate exactly 4 clips with precise, realistic timestamps. Make them varied in length (15s, 30s, 45s, 60s range).

Output ONLY valid JSON with no markdown. Exactly this structure:
{
  "topic": "inferred topic in 5-8 words",
  "total_clips": 4,
  "best_clip_index": 0,
  "clips": [
    {
      "clip_number": 1,
      "title": "Short punchy title for this clip",
      "timestamp_start": "0:12",
      "timestamp_end": "0:43",
      "hook": "The exact first sentence/action that grabs viewers",
      "why_viral": "1-2 sentences on the psychological trigger that makes this clip shareable",
      "platform_fit": ["TikTok", "Reels"]
    },
    {
      "clip_number": 2,
      "title": "Short punchy title for this clip",
      "timestamp_start": "1:05",
      "timestamp_end": "1:50",
      "hook": "The exact first sentence/action that grabs viewers",
      "why_viral": "1-2 sentences on why this clip would get saved and reshared",
      "platform_fit": ["Shorts", "Reels", "TikTok"]
    },
    {
      "clip_number": 3,
      "title": "Short punchy title for this clip",
      "timestamp_start": "2:18",
      "timestamp_end": "2:48",
      "hook": "The exact first sentence/action that grabs viewers",
      "why_viral": "1-2 sentences on the emotion or curiosity this clip triggers",
      "platform_fit": ["TikTok"]
    },
    {
      "clip_number": 4,
      "title": "Short punchy title for this clip",
      "timestamp_start": "3:30",
      "timestamp_end": "4:05",
      "hook": "The exact first sentence/action that grabs viewers",
      "why_viral": "1-2 sentences explaining its viral potential",
      "platform_fit": ["Shorts", "TikTok"]
    }
  ],
  "platform_tips": {
    "tiktok": "Specific tip for posting this content on TikTok — optimal length, sound, hook style",
    "youtube_shorts": "Specific tip for YouTube Shorts — title format, thumbnail, timing",
    "instagram_reels": "Specific tip for Instagram Reels — caption, cover frame, audio"
  },
  "caption": "A ready-to-post viral caption under 150 characters with urgency and curiosity",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5", "#hashtag6"]
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 1200,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Generate a clip strategy for: ${url}\nTarget platform: ${targetPlatform}` },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "";

  let result: object;
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON");
    result = JSON.parse(match[0]);
  } catch {
    req.log.error({ raw }, "Failed to parse clip-analyze response");
    res.status(500).json({ error: "Failed to parse AI response. Please try again." });
    return;
  }

  clipCounts.set(ip, count + 1);
  res.json({ ...result, remainingClips: FREE_LIMIT - (count + 1), isLimitReached: FREE_LIMIT - (count + 1) <= 0 });
});

export default router;
