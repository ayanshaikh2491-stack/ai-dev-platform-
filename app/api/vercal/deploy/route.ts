import { NextResponse } from "next/server";
import { createDeployment } from "@/lib/vercel";

export async function POST(req: Request) {
  try {
    const { projectName, files } = await req.json();

    const result = await createDeployment(projectName, files);

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || "Deployment failed" 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      deploymentId: result.deploymentId,
      message: "Deployed successfully!",
    });
  } catch (error) {
    console.error("Deploy API error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Internal server error" 
    }, { status: 500 });
  }
}
