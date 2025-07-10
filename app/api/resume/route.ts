import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "pdf";

    const resumeDir = path.join(process.cwd(), "public", "resumes");
    const files = await fs.readdir(resumeDir);

    // Look for resume files with the requested format
    let resumeFile = files.find(
      (file) =>
        file.toLowerCase().includes("resume") &&
        file.toLowerCase().endsWith(format.toLowerCase())
    );

    // If DOCX is requested but not found, try to find any DOCX file
    if (!resumeFile && format.toLowerCase() === "docx") {
      resumeFile = files.find((file) => file.toLowerCase().endsWith(".docx"));
    }

    // If PDF is requested but not found, try to find any PDF file
    if (!resumeFile && format.toLowerCase() === "pdf") {
      resumeFile = files.find((file) => file.toLowerCase().endsWith(".pdf"));
    }

    if (!resumeFile) {
      return NextResponse.json(
        {
          error: `Resume not found in ${format.toUpperCase()} format. Please upload a resume file to the public/resumes/ directory.`,
        },
        { status: 404 }
      );
    }

    const filePath = path.join(resumeDir, resumeFile);
    const fileBuffer = await fs.readFile(filePath);

    const headers = new Headers();

    // Set appropriate content type based on file extension
    const fileExtension = resumeFile.split(".").pop()?.toLowerCase();
    if (fileExtension === "pdf") {
      headers.set("Content-Type", "application/pdf");
    } else if (fileExtension === "docx") {
      headers.set(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
    } else {
      headers.set("Content-Type", "application/octet-stream");
    }

    headers.set(
      "Content-Disposition",
      `attachment; filename="Daniel_Koryat_Resume.${fileExtension}"`
    );

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Resume download error:", error);
    return NextResponse.json(
      { error: "Failed to download resume. Please try again later." },
      { status: 500 }
    );
  }
}
