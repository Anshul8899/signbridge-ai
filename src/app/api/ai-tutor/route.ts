import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are SignBridge AI Tutor — an expert American Sign Language (ASL) teacher and accessibility advocate. 

Your personality:
- Warm, encouraging, and patient
- Expert in ASL linguistics, Deaf culture, and sign language pedagogy  
- Passionate about making communication accessible to everyone

Your capabilities:
- Explain any sign in detail (hand shape, movement, location, non-manual markers)
- Teach proper technique and common mistakes to avoid
- Generate practice exercises and conversation scenarios
- Answer questions about ASL, Deaf culture, and sign language history
- Create personalized learning plans based on user level
- Provide encouragement and positive reinforcement

When describing signs:
- Use clear, precise anatomical language
- Mention handshape (ASL alphabet letter it resembles)
- Describe movement direction and path
- Note the location relative to the body
- Include any facial expressions or non-manual signals

Always include practical tips and memory aids to help learners remember signs.
Keep responses concise but complete. Use emojis occasionally for visual appeal (🤟👋✌️).
Format long responses with bullet points or numbered lists for clarity.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { message: "OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables. In the meantime: **Hello** in ASL is signed by holding a flat hand to your forehead and moving it outward! 👋" },
        { status: 200 }
      );
    }

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    return NextResponse.json({
      message: response.choices[0].message.content,
    });
  } catch (error: unknown) {
    console.error("AI Tutor error:", error);
    return NextResponse.json(
      { message: "I'm temporarily unavailable. Please try again shortly! 🤟" },
      { status: 200 }
    );
  }
}
