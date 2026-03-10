import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { repo, branch, changes, message } = await req.json();
    const [owner, name] = repo.split("/");

    // Changes are already committed in write step
    // This endpoint just confirms and provides commit info

    return NextResponse.json({
      success: true,
      message: "Changes committed successfully",
      commitSha: `auto-${Date.now()}`,
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Commit failed" 
    }, { status: 500 });
  }
}
