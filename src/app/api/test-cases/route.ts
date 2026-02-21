import { NextResponse } from "next/server";
import { generateStructuredJson } from "@/lib/ai-client";
import { getCompanyPromptContext } from "@/lib/prompt-context";
import type { TestCaseRequest } from "@/lib/types";

type TestCaseItem = {
  id: string;
  title: string;
  type: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  preconditions: string[];
  steps: string[];
  expectedResult: string;
  testData?: string;
  coverageTag?: string;
};

type TestCaseResponse = {
  summary: string;
  testCases: TestCaseItem[];
};

function buildPrompt(input: TestCaseRequest): string {
  const companyContext = getCompanyPromptContext();
  const filesText = (input.files || [])
    .filter((file) => file.text)
    .map(
      (file) =>
        `File: ${file.name}\nType: ${file.type}\nExtracted text:\n${file.text.slice(0, 8000)}`,
    )
    .join("\n\n---\n\n");

  return `You are a senior QA engineer. Generate professional test cases using ISO/IEC/IEEE 29119 mindset.

${companyContext}

Return STRICT JSON with this schema:
{
  "summary": "string",
  "testCases": [
    {
      "id": "TC-001",
      "title": "string",
      "type": "Functional|Boundary|Negative|Security|Usability|Compatibility",
      "priority": "Low|Medium|High|Critical",
      "preconditions": ["string"],
      "steps": ["string"],
      "expectedResult": "string",
      "testData": "string",
      "coverageTag": "which acceptance criteria this covers"
    }
  ]
}

Rules:
- Create at least 8 high-quality test cases.
- Include boundary, negative, and security-focused tests.
- Keep steps executable and specific.
- Map each test case to explicit acceptance criteria IDs (AC-1, AC-2, ...).
- Do not use vague text like "implicit" in coverageTag.
- Ensure every acceptance criterion has at least one mapped test case.
- Do not include markdown, only JSON.

User Input:
Title: ${input.title}
Description: ${input.description}
Acceptance Criteria:
${input.acceptanceCriteria}
Prerequisites: ${input.prerequisites || "N/A"}
Additional Information: ${input.additionalInfo || "N/A"}

Supporting File Text:
${filesText || "None"}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TestCaseRequest;

    if (!body.title || !body.description || !body.acceptanceCriteria) {
      return NextResponse.json(
        { error: "Title, description, and acceptance criteria are required." },
        { status: 400 },
      );
    }

    const prompt = buildPrompt(body);
    const generated = await generateStructuredJson<TestCaseResponse>(
      prompt,
      Boolean(body.deepAnalysis),
    );

    if (!generated?.testCases?.length) {
      return NextResponse.json(
        { error: "AI did not return valid test cases. Please try again." },
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
            : "Failed to generate test cases.",
      },
      { status: 500 },
    );
  }
}
