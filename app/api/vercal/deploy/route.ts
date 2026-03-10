// app/api/vercel/deploy/route.ts
import { NextResponse } from "next/server";
import { createDeployment } from "@/lib/vercel"; // ✅ Ye ab kaam karega

export async function POST(req: Request) {
  try {
    const { projectName, files } = await req.json();
    const result = await createDeployment(projectName, files);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      deploymentId: result.deploymentId,
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Deploy failed" 
    }, { status: 500 });
  }
}
