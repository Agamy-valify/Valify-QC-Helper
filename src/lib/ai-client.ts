import { extractJsonObject, safeJsonParse } from "./json";

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

export async function generateStructuredJson<T>(prompt: string, deepAnalysis = false): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const model = deepAnalysis ? "gemini-2.5-pro" : "gemini-2.5-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: deepAnalysis ? 0.4 : 0.3,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as GeminiResponse;
  const rawText =
    data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("\n")?.trim() ?? "";

  const jsonText = extractJsonObject(rawText);
  return safeJsonParse<T>(jsonText, {} as T);
}
