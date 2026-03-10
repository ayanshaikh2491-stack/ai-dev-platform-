import { NextResponse } from "next/server";
import { readFile } from "@/lib/github";

export async function POST(req: Request) {
  try {
    const { repo, branch, path } = await req.json();
    const [owner, name] = repo.split("/");

    const content = await readFile(owner, name, path, branch);

    return NextResponse.json({
      success: true,
      content,
      path,
    });
  } catch (error) {
    console.error("GitHub read error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "GitHub read failed" 
    }, { status: 500 });
  }
}
