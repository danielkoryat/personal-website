import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "pdf";

    const resumeDir = path.join(process.cwd(), "public", "resumes");
    const files = await fs.readdir(resumeDir);

    // Look for resume files with the requested format
    const resumeFile = files.find(
      (file) =>
        file.toLowerCase().includes("resume") &&
        file.toLowerCase().endsWith(format.toLowerCase())
    );

    if (!resumeFile) {
      return NextResponse.json(
        { error: `Resume not found in ${format.toUpperCase()} format` },
        { status: 404 }
      );
    }

    const filePath = path.join(resumeDir, resumeFile);
    const fileBuffer = await fs.readFile(filePath);

    const headers = new Headers();
    headers.set("Content-Type", `application/${format.toLowerCase()}`);
    headers.set("Content-Disposition", `attachment; filename="${resumeFile}"`);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Resume download error:", error);
    return NextResponse.json(
      { error: "Failed to download resume" },
      { status: 500 }
    );
  }
}
