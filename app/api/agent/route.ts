import { NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function POST(req: Request) {
  try {
    const { repo, instruction, branch } = await req.json();

    if (!repo || !instruction) {
      return NextResponse.json({ error: "Missing repo or instruction" }, { status: 400 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: "You are a helpful AI coding assistant. Output a summary of what you'll build." 
          },
          { 
            role: "user", 
            content: `Repo: ${repo}\nBranch: ${branch}\nTask: ${instruction}` 
          }
        ],
        max_tokens: 512,
        temperature: 0.5,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Task processed";

    return NextResponse.json({
      success: true,
      plan: {
        summary: content,
        estimatedTime: "5-10 minutes",
      },
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed" 
    }, { status: 500 });
  }
}
