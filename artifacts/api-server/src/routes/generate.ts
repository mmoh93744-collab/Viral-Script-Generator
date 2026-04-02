import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GenerateScriptBody } from "@workspace/api-zod";

const router: IRouter = Router();

const FREE_LIMIT = 2;
const requestCounts = new Map<string, number>();

router.post("/generate", async (req, res): Promise<void> => {
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "unknown";

  const count = requestCounts.get(ip) ?? 0;

  if (count >= FREE_LIMIT) {
    res.status(429).json({
      error: "FREE_LIMIT_REACHED",
    });
    return;
  }

  const parsed = GenerateScriptBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { topic } = parsed.data;

  const systemPrompt = `You are an elite YouTube Shorts scriptwriter who has studied every viral video in history. 
Your scripts follow a strict viral formula:
- HOOK: The first 1-3 seconds are EVERYTHING. Must cause immediate pattern interrupt, trigger curiosity or emotional shock. Start mid-action or with a bold provocative statement. NO "Hey guys" or boring intros.
- BODY: 8-10 seconds of pure value. Use power words, build tension, reveal one transformative insight. Every word earns its place.
- CTA: 2-3 seconds. Specific, urgent, value-driven. Make stopping feel like a loss.

Rules:
- Max 15 seconds total when spoken aloud
- Each section is 1-3 short punchy sentences
- Use pattern interrupts, open loops, and emotional triggers
- Write for spoken delivery - natural, conversational, urgent
- Never use filler words or generic phrases
- Every sentence must earn attention

Return ONLY valid JSON in exactly this format with no extra text:
{"hook": "...", "body": "...", "cta": "..."}`;

  const userPrompt = `Create a viral YouTube Shorts script about: "${topic}"`;

  const completion = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 500,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "";

  let script: { hook: string; body: string; cta: string };
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    script = JSON.parse(jsonMatch[0]);
    if (!script.hook || !script.body || !script.cta) throw new Error("Invalid structure");
  } catch {
    req.log.error({ raw }, "Failed to parse AI response");
    res.status(500).json({ error: "Failed to parse AI response" });
    return;
  }

  requestCounts.set(ip, count + 1);
  const remainingRequests = FREE_LIMIT - (count + 1);

  res.json({
    hook: script.hook,
    body: script.body,
    cta: script.cta,
    remainingRequests,
    isLimitReached: remainingRequests <= 0,
  });
});

export default router;
