import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const FORMATS = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;

type Format = keyof typeof FORMATS;

function isFormat(value: string): value is Format {
  return value in FORMATS;
}

export async function GET(request: NextRequest) {
  const requested = (
    new URL(request.url).searchParams.get("format") ?? "pdf"
  ).toLowerCase();

  // Restrict to known formats so the extension used for lookup and for the
  // download filename can never come from arbitrary input.
  if (!isFormat(requested)) {
    return NextResponse.json(
      { error: "Unsupported format. Use 'pdf' or 'docx'." },
      { status: 400 }
    );
  }

  try {
    const resumeDir = path.join(process.cwd(), "public", "resumes");
    const files = await fs.readdir(resumeDir);
    const suffix = `.${requested}`;

    // Prefer a file that is actually named like a resume, but fall back to any
    // file of the right type.
    const resumeFile =
      files.find(
        (file) =>
          file.toLowerCase().endsWith(suffix) &&
          file.toLowerCase().includes("resume")
      ) ?? files.find((file) => file.toLowerCase().endsWith(suffix));

    if (!resumeFile) {
      return NextResponse.json(
        { error: `No ${requested.toUpperCase()} resume is available.` },
        { status: 404 }
      );
    }

    const fileBuffer = await fs.readFile(path.join(resumeDir, resumeFile));

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": FORMATS[requested],
        "Content-Disposition": `attachment; filename="Daniel_Koryat_Resume.${requested}"`,
        "Content-Length": String(fileBuffer.byteLength),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    // A missing public/resumes directory is a 404, not a server fault.
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ error: "No resume available." }, { status: 404 });
    }

    console.error("Resume download error:", error);
    return NextResponse.json(
      { error: "Failed to download resume. Please try again later." },
      { status: 500 }
    );
  }
}
