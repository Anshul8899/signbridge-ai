import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        signs: (text as string).split(" ").map((word: string) => ({
          word,
          description: `Sign for "${word}"`,
          emoji: "🤟",
        })),
      });
    }

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an ASL expert. Given text, return a JSON array of objects with 'word', 'description' (brief sign description), and 'emoji' (relevant emoji). Return ONLY valid JSON array, no markdown.",
        },
        {
          role: "user",
          content: `Convert to ASL signs: "${text}"`,
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const content = response.choices[0].message.content ?? "[]";
    const signs = JSON.parse(content);

    return NextResponse.json({ signs });
  } catch (error) {
    console.error("Text to sign error:", error);
    return NextResponse.json({ signs: [] }, { status: 500 });
  }
}
