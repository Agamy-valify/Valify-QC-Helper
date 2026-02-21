import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";

export const runtime = "nodejs";

const TEXT_EXTENSIONS = new Set([
  ".txt",
  ".md",
  ".log",
  ".json",
  ".xml",
  ".yaml",
  ".yml",
  ".csv",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".css",
  ".scss",
  ".html",
  ".sql",
  ".sh",
  ".bat",
  ".ini",
  ".properties",
  ".java",
  ".py",
  ".go",
  ".rs",
  ".php",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
]);

function getExtension(name: string): string {
  const index = name.lastIndexOf(".");
  return index >= 0 ? name.slice(index).toLowerCase() : "";
}

async function extractTextFromFile(file: File): Promise<string> {
  const extension = getExtension(file.name);

  if (file.type === "application/pdf" || extension === ".pdf") {
    const buffer = Buffer.from(await file.arrayBuffer());
    const pdf = await pdfParse(buffer);
    return (pdf.text || "").trim();
  }

  if (file.type.startsWith("text/") || TEXT_EXTENSIONS.has(extension)) {
    return (await file.text()).trim();
  }

  return "";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File);

    const maxFiles = Number(process.env.MAX_UPLOAD_FILES || 50);
    const maxSizeMb = Number(process.env.MAX_UPLOAD_FILE_SIZE_MB || 25);
    const maxSizeBytes = maxSizeMb * 1024 * 1024;

    if (files.length > maxFiles) {
      return NextResponse.json(
        { error: `Too many files. Max allowed is ${maxFiles}.` },
        { status: 400 },
      );
    }

    const parsedFiles = [] as Array<{
      name: string;
      type: string;
      size: number;
      text: string;
      parsed: boolean;
    }>;

    for (const file of files) {
      if (file.size > maxSizeBytes) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds ${maxSizeMb}MB limit.` },
          { status: 400 },
        );
      }

      const text = await extractTextFromFile(file);

      parsedFiles.push({
        name: file.name,
        type: file.type,
        size: file.size,
        text,
        parsed: Boolean(text),
      });
    }

    return NextResponse.json({ files: parsedFiles });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to parse uploaded files.",
      },
      { status: 500 },
    );
  }
}
