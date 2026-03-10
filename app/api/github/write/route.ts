import { NextResponse } from "next/server";
import { writeFile } from "@/lib/github";

export async function POST(req: Request) {
  try {
    const { repo, branch, steps } = await req.json();
    const [owner, name] = repo.split("/");

    const fileChanges = [];

    for (const step of steps) {
      if (!step.code && step.action !== "read" && step.action !== "delete") {
        continue;
      }

      if (step.action === "create" || step.action === "edit") {
        await writeFile(
          owner,
          name,
          step.file,
          step.code,
          `AI Agent: ${step.reason || `Update ${step.file}`}`,
          branch
        );

        fileChanges.push({
          path: step.file,
          action: step.action,
          content: step.code,
        });
      }
    }

    return NextResponse.json({
      success: true,
      fileChanges,
      message: `Successfully processed ${fileChanges.length} files`,
    });
  } catch (error) {
    console.error("GitHub write error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "GitHub operation failed" 
    }, { status: 500 });
  }
}
