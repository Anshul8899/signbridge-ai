import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { lesson, count = 5 } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        questions: [
          { id: "1", type: "multiple-choice", question: "What sign uses a flat hand moving away from the forehead?", options: ["Hello", "Thank You", "Please", "Sorry"], correctAnswer: "Hello", xpReward: 20 },
          { id: "2", type: "multiple-choice", question: "How do you sign 'Thank You' in ASL?", options: ["Wave hand", "Flat hand from chin outward", "Tap forehead", "Circle on chest"], correctAnswer: "Flat hand from chin outward", xpReward: 20 },
          { id: "3", type: "multiple-choice", question: "Which handshape is used for the letter 'A' in ASL?", options: ["Open palm", "Fist with thumb on side", "Two fingers up", "Curved hand"], correctAnswer: "Fist with thumb on side", xpReward: 25 },
        ],
      });
    }

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an ASL quiz generator. Generate quiz questions about sign language. Return ONLY a JSON array of questions with fields: id (string), type ('multiple-choice'), question (string), options (array of 4 strings), correctAnswer (string matching one option), xpReward (number 10-30). No markdown.",
        },
        {
          role: "user",
          content: `Generate ${count} quiz questions about ASL ${lesson ? `focusing on "${lesson}"` : "covering basic signs, alphabet, greetings, and numbers"}.`,
        },
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content ?? "[]";
    const questions = JSON.parse(content);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json({ questions: [] }, { status: 500 });
  }
}
