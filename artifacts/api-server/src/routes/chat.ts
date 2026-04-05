import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { ChatBody } from "@workspace/api-zod";

const router: IRouter = Router();
const FREE_LIMIT = 5;
const chatCounts = new Map<string, number>();

const SYSTEM_PROMPT = `You are ViralAI — an elite social media growth expert with deep knowledge of the TikTok, YouTube Shorts, and Instagram Reels algorithms.

You help creators:
- Write viral hooks, scripts, and CTAs for short-form video
- Understand why content goes viral on each platform
- Grow their following with data-backed strategies
- Optimize posting times, hashtags, and captions
- Analyze what's working in their niche and how to beat competitors

Tone: Direct, energetic, confident. Like a top-tier creator coach who has helped accounts go from 0 to 1M+ followers.

Always give specific, actionable advice. Never give generic tips. Back your advice with platform-specific logic.

Format your responses with clear structure. Use short paragraphs. Use bullet points when listing items. Bold key insights. Keep replies concise but packed with value.`;

router.post("/chat", async (req, res): Promise<void> => {
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "unknown";

  const count = chatCounts.get(ip) ?? 0;
  if (count >= FREE_LIMIT) {
    res.status(429).json({ error: "FREE_LIMIT_REACHED" });
    return;
  }

  const parsed = ChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { messages, platform } = parsed.data;

  const systemContent = platform
    ? `${SYSTEM_PROMPT}\n\nThe user is currently focused on: ${platform}.`
    : SYSTEM_PROMPT;

  const completion = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 600,
    messages: [
      { role: "system", content: systemContent },
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ],
  });

  const reply = completion.choices[0]?.message?.content ?? "Sorry, I couldn't generate a response. Please try again.";
  chatCounts.set(ip, count + 1);
  const remainingChats = FREE_LIMIT - (count + 1);

  res.json({ reply, remainingChats, isLimitReached: remainingChats <= 0 });
});

export default router;
