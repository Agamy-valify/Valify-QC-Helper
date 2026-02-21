import { NextResponse } from "next/server";
import { generateStructuredJson } from "@/lib/ai-client";
import { getCompanyPromptContext } from "@/lib/prompt-context";
import type { BugReportRequest } from "@/lib/types";

type BugReportResponse = {
  title: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  priority: "P3" | "P2" | "P1" | "P0";
  environment: string;
  stepsToReproduce: string[];
  expectedResult: string;
  actualResult: string;
  impact: string;
  workaround: string;
  rootCauseHypothesis: string;
  attachmentsSummary: string;
};

function buildPrompt(input: BugReportRequest): string {
  const companyContext = getCompanyPromptContext();
  const optional = input.optionalFields || {};
  const filesText = (input.files || [])
    .filter((file) => file.text)
    .map(
      (file) =>
        `File: ${file.name}\nType: ${file.type}\nExtracted text:\n${file.text.slice(0, 8000)}`,
    )
    .join("\n\n---\n\n");

  return `You are an expert QA lead. Convert the incident details into a high-quality bug report inspired by IEEE 829 style.

${companyContext}

Return STRICT JSON with this schema:
{
  "title": "string",
  "severity": "Low|Medium|High|Critical",
  "priority": "P3|P2|P1|P0",
  "environment": "string",
  "stepsToReproduce": ["string"],
  "expectedResult": "string",
  "actualResult": "string",
  "impact": "string",
  "workaround": "string",
  "rootCauseHypothesis": "string",
  "attachmentsSummary": "string"
}

Rules:
- Steps must be reproducible.
- Keep language factual and concise.
- Do not include markdown.

What happened:
${input.whatHappened}

Optional details:
Environment: ${optional.environment || "N/A"}
Bug Type / Category: ${optional.bugTypeCategory || "N/A"}
Workaround: ${optional.workaround || "N/A"}
Preconditions: ${optional.preconditions || "N/A"}
Affected Module: ${optional.affectedModule || "N/A"}
Impact / Business Risk: ${optional.impactBusinessRisk || "N/A"}
Reproducibility: ${optional.reproducibility || "N/A"}
Test Data: ${optional.testData || "N/A"}
System Logs: ${optional.systemLogs || "N/A"}

Supporting File Text:
${filesText || "None"}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BugReportRequest;

    if (!body.whatHappened?.trim()) {
      return NextResponse.json(
        { error: "What happened is required." },
        { status: 400 },
      );
    }

    const prompt = buildPrompt(body);
    const generated = await generateStructuredJson<BugReportResponse>(
      prompt,
      Boolean(body.deepAnalysis),
    );

    if (!generated?.title || !generated?.stepsToReproduce?.length) {
      return NextResponse.json(
        { error: "AI did not return a valid bug report. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json(generated);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate bug report.",
      },
      { status: 500 },
    );
  }
}
