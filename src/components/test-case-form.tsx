"use client";

import React, { useMemo, useState } from "react";
import FileUpload from "./file-upload";
import type { UploadedFileContent } from "@/lib/types";

type TestCaseItem = {
  id: string;
  title: string;
  type: string;
  priority: string;
  preconditions: string[];
  steps: string[];
  expectedResult: string;
  testData?: string;
  coverageTag?: string;
};

type ResultShape = {
  summary: string;
  testCases: TestCaseItem[];
};

const initialForm = {
  title: "",
  description: "",
  acceptanceCriteria: "",
  prerequisites: "",
  additionalInfo: "",
  deepAnalysis: false,
};

async function parseFiles(files: File[]): Promise<UploadedFileContent[]> {
  if (!files.length) {
    return [];
  }

  const payload = new FormData();
  files.forEach((file) => payload.append("files", file));

  const response = await fetch("/api/uploads", {
    method: "POST",
    body: payload,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "Failed to parse files");
  }

  return data.files || [];
}

function downloadJsonFile(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function escapeCsvField(value: string): string {
  const normalized = value.replace(/\r?\n|\r/g, " ").trim();
  return `"${normalized.replace(/"/g, '""')}"`;
}

function buildClickUpCsv(result: ResultShape): string {
  const header = [
    "Task Name",
    "Description",
    "Priority",
    "Status",
    "Tags",
  ];

  const rows = result.testCases.map((testCase) => {
    const description = [
      `Test Case ID: ${testCase.id}`,
      `Type: ${testCase.type}`,
      `Coverage: ${testCase.coverageTag || "N/A"}`,
      `Preconditions: ${testCase.preconditions.join(" | ") || "N/A"}`,
      `Test Data: ${testCase.testData || "N/A"}`,
      `Steps: ${testCase.steps.join(" -> ")}`,
      `Expected Result: ${testCase.expectedResult}`,
    ].join("\n");

    return [
      testCase.title,
      description,
      testCase.priority,
      "To Do",
      testCase.type,
    ].map(escapeCsvField).join(",");
  });

  return [header.join(","), ...rows].join("\n");
}

function downloadTextFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function buildClickUpPaste(result: ResultShape): string {
  const header = [
    "Task Name",
    "Description",
    "Priority",
    "Status",
    "Tags",
  ];

  const rows = result.testCases.map((testCase) => {
    const description = [
      `Test Case ID: ${testCase.id}`,
      `Type: ${testCase.type}`,
      `Coverage: ${testCase.coverageTag || "N/A"}`,
      `Preconditions: ${testCase.preconditions.join(" | ") || "N/A"}`,
      `Test Data: ${testCase.testData || "N/A"}`,
      `Steps: ${testCase.steps.join(" -> ")}`,
      `Expected Result: ${testCase.expectedResult}`,
    ].join("\n");

    return [
      testCase.title,
      description,
      testCase.priority,
      "To Do",
      testCase.type,
    ];
  });

  return [header, ...rows].map((row) => row.join("\t")).join("\n");
}

export default function TestCaseForm() {
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResultShape | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleCopyClickUp = async () => {
    if (!result) {
      return;
    }

    const pasteText = buildClickUpPaste(result);
    try {
      await navigator.clipboard.writeText(pasteText);
      setError("");
    } catch {
      setError("Unable to copy. Please use Export ClickUp CSV instead.");
    }
  };

  const handleExportClickUpCsv = () => {
    if (!result) {
      return;
    }

    const csv = buildClickUpCsv(result);
    downloadTextFile("clickup-test-cases.csv", csv, "text/csv;charset=utf-8;");
  };

  const canSubmit = useMemo(() => {
    return (
      form.title.trim().length > 0 &&
      form.description.trim().length > 0 &&
      form.acceptanceCriteria.trim().length > 0 &&
      !loading
    );
  }, [form, loading]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? (event.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const parsedFiles = await parseFiles(files);

      const response = await fetch("/api/test-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, files: parsedFiles }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate test cases");
      }

      setResult(data as ResultShape);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tool-grid">
      <section className="panel">
        <h2>User Story Details</h2>
        <p className="muted">
          Provide requirements and acceptance criteria. The AI applies formal test design
          techniques for edge cases and security coverage.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="label">Title</span>
            <input
              id="title"
              name="title"
              placeholder="e.g., User Login Functionality"
              value={form.title}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span className="label">Description</span>
            <textarea
              id="description"
              name="description"
              placeholder="As a [user], I want to [action]..."
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
            />
          </label>

          <label className="field">
            <span className="label">Acceptance Criteria</span>
            <textarea
              id="acceptanceCriteria"
              name="acceptanceCriteria"
              placeholder="- User must enter valid email..."
              value={form.acceptanceCriteria}
              onChange={handleChange}
              required
              rows={5}
            />
          </label>

          <label className="field">
            <span className="label">Prerequisites (Optional)</span>
            <input
              id="prerequisites"
              name="prerequisites"
              placeholder="e.g., Registered account"
              value={form.prerequisites}
              onChange={handleChange}
            />
          </label>

          <label className="field">
            <span className="label">Additional Information (Optional)</span>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              placeholder="Any edge cases or specific constraints..."
              value={form.additionalInfo}
              onChange={handleChange}
              rows={3}
            />
          </label>

          <FileUpload id="files" files={files} onFilesChange={setFiles} />

          <label className="switch-row" htmlFor="deepAnalysis">
            <input
              id="deepAnalysis"
              name="deepAnalysis"
              type="checkbox"
              checked={form.deepAnalysis}
              onChange={handleChange}
            />
            <span>
              <strong>Enable Deep Analysis</strong>
              <small>
                Activates advanced reasoning models for detailed, step-by-step analysis
                (slower but more thorough)
              </small>
            </span>
          </label>

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={!canSubmit}>
            {loading ? "Generating..." : "Generate Test Cases"}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="result-header">
          <h2>Generated Test Cases</h2>
          {result && (
            <div className="result-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setIsPreviewOpen(true)}
              >
                Preview Table
              </button>
              <button type="button" className="secondary" onClick={handleCopyClickUp}>
                Copy ClickUp Paste
              </button>
              <button type="button" className="secondary" onClick={handleExportClickUpCsv}>
                Export ClickUp CSV
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => downloadJsonFile("test-cases.json", result)}
              >
                Export JSON
              </button>
            </div>
          )}
        </div>

        {!result && <p className="muted">Submit the form to view generated test cases.</p>}

        {result && (
          <>
            <p className="muted">{result.summary}</p>
            <div className="cards">
              {result.testCases.slice(0, 4).map((testCase) => (
                <article key={testCase.id} className="card">
                  <h3>{testCase.id}: {testCase.title}</h3>
                  <p className="muted">{testCase.type} • {testCase.priority}</p>
                  <p><strong>Expected:</strong> {testCase.expectedResult}</p>
                </article>
              ))}
              {result.testCases.length > 4 && (
                <p className="muted">Showing 4 of {result.testCases.length} rows. Use Preview Table for full data.</p>
              )}
            </div>
          </>
        )}

        {result && isPreviewOpen && (
          <div className="preview-modal" role="dialog" aria-modal="true" aria-label="Test case table preview">
            <div className="preview-modal-content">
              <div className="preview-modal-header">
                <h3>Test Case Preview Table</h3>
                <button type="button" className="secondary" onClick={() => setIsPreviewOpen(false)}>
                  Close
                </button>
              </div>
              <div className="table-wrap">
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Priority</th>
                      <th>Preconditions</th>
                      <th>Steps</th>
                      <th>Expected Result</th>
                      <th>Coverage</th>
                      <th>Test Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.testCases.map((testCase) => (
                      <tr key={testCase.id}>
                        <td>{testCase.id}</td>
                        <td>{testCase.title}</td>
                        <td>{testCase.type}</td>
                        <td>{testCase.priority}</td>
                        <td>{testCase.preconditions.join("; ") || "N/A"}</td>
                        <td>{testCase.steps.join(" -> ")}</td>
                        <td>{testCase.expectedResult}</td>
                        <td>{testCase.coverageTag || "N/A"}</td>
                        <td>{testCase.testData || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
