import { NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const SYSTEM_PROMPT = `You are NEXUS AI Agent - an elite autonomous development assistant with 50+ years of experience.

YOUR CAPABILITIES:
• Full-stack development (React, Next.js, Node.js, TypeScript, Tailwind)
• System architecture & design patterns
• Git/GitHub operations
• DevOps & deployment (Vercel)
• Debugging & optimization

THINKING PROCESS:
1. ANALYZE the requirement deeply
2. PLAN step-by-step execution
3. ANTICIPATE potential issues
4. EXECUTE with production-quality code
5. VERIFY the solution

OUTPUT FORMAT (JSON):
{
  "plan": {
    "summary": "Brief description",
    "estimatedTime": "Realistic estimate",
    "risks": ["potential risks"],
    "steps": [
      {
        "action": "read|create|edit|delete",
        "file": "path/to/file.tsx",
        "reason": "Why this step",
        "code": "Complete code if creating/editing"
      }
    ]
  }
}

CRITICAL RULES:
• NEVER break existing functionality
• ALWAYS provide complete, working code
• NEVER expose secrets or API keys
• ALWAYS explain what you're doing`;

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
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Repository: ${repo}\nBranch: ${branch}\n\nTask: ${instruction}\n\nCreate a detailed execution plan.` }
        ],
        max_tokens: 8192,
        temperature: 0.5,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Try to parse JSON from response
    let plan;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      plan = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      plan = null;
    }

    return NextResponse.json({
      success: true,
      plan: plan || {
        summary: content.substring(0, 200),
        steps: [],
        estimatedTime: "Unknown",
        risks: [],
      },
      rawResponse: content,
    });
  } catch (error) {
    console.error("Agent error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "AI processing failed" 
    }, { status: 500 });
  }
}
