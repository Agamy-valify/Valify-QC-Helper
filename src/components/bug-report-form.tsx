"use client";

import React, { useMemo, useState } from "react";
import FileUpload from "./file-upload";
import type { UploadedFileContent } from "@/lib/types";

type BugResult = {
  title: string;
  severity: string;
  priority: string;
  environment: string;
  stepsToReproduce: string[];
  expectedResult: string;
  actualResult: string;
  impact: string;
  workaround: string;
  rootCauseHypothesis: string;
  attachmentsSummary: string;
};

type OptionalKey =
  | "environment"
  | "bugTypeCategory"
  | "workaround"
  | "preconditions"
  | "affectedModule"
  | "impactBusinessRisk"
  | "reproducibility"
  | "testData"
  | "systemLogs";

const optionalLabels: Record<OptionalKey, string> = {
  environment: "Environment",
  bugTypeCategory: "Bug Type / Category",
  workaround: "Workaround",
  preconditions: "Preconditions",
  affectedModule: "Affected Module",
  impactBusinessRisk: "Impact / Business Risk",
  reproducibility: "Reproducibility",
  testData: "Test Data",
  systemLogs: "System Logs",
};

async function parseFiles(files: File[]): Promise<UploadedFileContent[]> {
  if (!files.length) return [];

  const payload = new FormData();
  files.forEach((file) => payload.append("files", file));

  const response = await fetch("/api/uploads", { method: "POST", body: payload });
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

function downloadTextFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
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

function buildClickUpPaste(report: BugResult): string {
  const header = [
    "Task Name",
    "Description",
    "Priority",
    "Status",
    "Tags",
  ];

  const description = [
    `Severity: ${report.severity}`,
    `Environment: ${report.environment || "N/A"}`,
    `Expected Result: ${report.expectedResult}`,
    `Actual Result: ${report.actualResult}`,
    `Impact: ${report.impact}`,
    `Workaround: ${report.workaround || "N/A"}`,
    `Root Cause Hypothesis: ${report.rootCauseHypothesis}`,
    `Attachments Summary: ${report.attachmentsSummary || "N/A"}`,
    `Steps: ${report.stepsToReproduce.join(" -> ")}`,
  ].join("\n");

  const row = [report.title, description, report.priority, "To Do", "Bug"];
  return [header, row].map((line) => line.join("\t")).join("\n");
}

function buildClickUpCsv(report: BugResult): string {
  const header = [
    "Task Name",
    "Description",
    "Priority",
    "Status",
    "Tags",
  ].join(",");

  const description = [
    `Severity: ${report.severity}`,
    `Environment: ${report.environment || "N/A"}`,
    `Expected Result: ${report.expectedResult}`,
    `Actual Result: ${report.actualResult}`,
    `Impact: ${report.impact}`,
    `Workaround: ${report.workaround || "N/A"}`,
    `Root Cause Hypothesis: ${report.rootCauseHypothesis}`,
    `Attachments Summary: ${report.attachmentsSummary || "N/A"}`,
    `Steps: ${report.stepsToReproduce.join(" -> ")}`,
  ].join("\n");

  const row = [report.title, description, report.priority, "To Do", "Bug"]
    .map(escapeCsvField)
    .join(",");

  return `${header}\n${row}`;
}

export default function BugReportForm() {
  const [whatHappened, setWhatHappened] = useState("");
  const [enabledFields, setEnabledFields] = useState<Record<OptionalKey, boolean>>({
    environment: false,
    bugTypeCategory: false,
    workaround: false,
    preconditions: false,
    affectedModule: false,
    impactBusinessRisk: false,
    reproducibility: false,
    testData: false,
    systemLogs: false,
  });
  const [optionalValues, setOptionalValues] = useState<Record<OptionalKey, string>>({
    environment: "",
    bugTypeCategory: "",
    workaround: "",
    preconditions: "",
    affectedModule: "",
    impactBusinessRisk: "",
    reproducibility: "",
    testData: "",
    systemLogs: "",
  });
  const [deepAnalysis, setDeepAnalysis] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<BugResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleCopyClickUp = async () => {
    if (!result) {
      return;
    }

    try {
      await navigator.clipboard.writeText(buildClickUpPaste(result));
      setError("");
    } catch {
      setError("Unable to copy. Please use Export ClickUp CSV instead.");
    }
  };

  const handleExportClickUpCsv = () => {
    if (!result) {
      return;
    }

    downloadTextFile(
      "clickup-bug-report.csv",
      buildClickUpCsv(result),
      "text/csv;charset=utf-8;",
    );
  };

  const activeOptionalFields = useMemo(() => {
    const output: Partial<Record<OptionalKey, string>> = {};
    (Object.keys(enabledFields) as OptionalKey[]).forEach((key) => {
      if (enabledFields[key] && optionalValues[key].trim()) {
        output[key] = optionalValues[key].trim();
      }
    });
    return output;
  }, [enabledFields, optionalValues]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const parsedFiles = await parseFiles(files);
      const response = await fetch("/api/bug-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatHappened,
          deepAnalysis,
          optionalFields: activeOptionalFields,
          files: parsedFiles,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate bug report");
      }

      setResult(data as BugResult);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tool-grid">
      <section className="panel">
        <h2>Describe the Issue</h2>
        <p className="muted">
          The AI analyzes evidence, correlates context, and creates a structured bug report.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="label">What happened?</span>
            <textarea
              value={whatHappened}
              onChange={(event) => setWhatHappened(event.target.value)}
              placeholder="e.g. I tried to login on iPhone with valid credentials but got a network error popup..."
              required
              rows={5}
            />
          </label>

          <FileUpload id="bug-files" files={files} onFilesChange={setFiles} />

          <div className="field">
            <span className="label">Include Optional Fields</span>
            <div className="checkbox-grid">
              {(Object.keys(optionalLabels) as OptionalKey[]).map((key) => (
                <label key={key} className="check-item">
                  <input
                    type="checkbox"
                    checked={enabledFields[key]}
                    onChange={(event) =>
                      setEnabledFields((previous) => ({
                        ...previous,
                        [key]: event.target.checked,
                      }))
                    }
                  />
                  <span>{optionalLabels[key]}</span>
                </label>
              ))}
            </div>
          </div>

          {(Object.keys(optionalLabels) as OptionalKey[])
            .filter((key) => enabledFields[key])
            .map((key) => (
              <label className="field" key={`${key}-value`}>
                <span className="label">{optionalLabels[key]}</span>
                <textarea
                  value={optionalValues[key]}
                  onChange={(event) =>
                    setOptionalValues((previous) => ({
                      ...previous,
                      [key]: event.target.value,
                    }))
                  }
                  rows={3}
                />
              </label>
            ))}

          <label className="switch-row" htmlFor="deepAnalysisBug">
            <input
              id="deepAnalysisBug"
              type="checkbox"
              checked={deepAnalysis}
              onChange={(event) => setDeepAnalysis(event.target.checked)}
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

          <button type="submit" disabled={!whatHappened.trim() || loading}>
            {loading ? "Generating..." : "Generate Bug Report"}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="result-header">
          <h2>Generated Bug Report</h2>
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
                onClick={() => downloadJsonFile("bug-report.json", result)}
              >
                Export JSON
              </button>
            </div>
          )}
        </div>

        {!result && <p className="muted">Submit the form to generate a structured bug report.</p>}

        {result && (
          <article className="card">
            <h3>{result.title}</h3>
            <p className="muted">Severity: {result.severity} • Priority: {result.priority}</p>
            <p><strong>Expected:</strong> {result.expectedResult}</p>
            <p><strong>Actual:</strong> {result.actualResult}</p>
            <p><strong>Impact:</strong> {result.impact}</p>
          </article>
        )}

        {result && isPreviewOpen && (
          <div className="preview-modal" role="dialog" aria-modal="true" aria-label="Bug report table preview">
            <div className="preview-modal-content">
              <div className="preview-modal-header">
                <h3>Bug Report Preview Table</h3>
                <button type="button" className="secondary" onClick={() => setIsPreviewOpen(false)}>
                  Close
                </button>
              </div>
              <div className="table-wrap">
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Severity</th>
                      <th>Priority</th>
                      <th>Environment</th>
                      <th>Expected</th>
                      <th>Actual</th>
                      <th>Impact</th>
                      <th>Workaround</th>
                      <th>Root Cause</th>
                      <th>Attachments Summary</th>
                      <th>Steps to Reproduce</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{result.title}</td>
                      <td>{result.severity}</td>
                      <td>{result.priority}</td>
                      <td>{result.environment || "N/A"}</td>
                      <td>{result.expectedResult}</td>
                      <td>{result.actualResult}</td>
                      <td>{result.impact}</td>
                      <td>{result.workaround || "N/A"}</td>
                      <td>{result.rootCauseHypothesis}</td>
                      <td>{result.attachmentsSummary || "N/A"}</td>
                      <td>{result.stepsToReproduce.join(" -> ")}</td>
                    </tr>
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
