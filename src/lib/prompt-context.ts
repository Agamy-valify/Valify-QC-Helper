function splitCsv(raw: string | undefined): string[] {
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function getCompanyPromptContext(): string {
  const defaultStandards = ["ISO/IEC/IEEE 29119", "IEEE 829", "OWASP ASVS"];
  const defaultServices = [
    "Validator Portal",
    "KYC Verification",
    "AML Screening",
    "Risk Scoring",
    "Identity Validation API",
  ];
  const defaultGuidance =
    "Use Valify terminology, prioritize fintech compliance and fraud-prevention risks, and keep outputs concise and engineering-actionable.";

  const companyName = process.env.COMPANY_NAME?.trim() || "Valify Solutions";
  const standards = splitCsv(process.env.COMPANY_QA_STANDARDS);
  const services = splitCsv(process.env.COMPANY_SERVICES);
  const extraGuidance = process.env.COMPANY_PROMPT_GUIDANCE?.trim();

  const effectiveStandards = standards.length ? standards : defaultStandards;
  const effectiveServices = services.length ? services : defaultServices;
  const effectiveGuidance = extraGuidance || defaultGuidance;

  const sections: string[] = [`Company context: ${companyName}`];

  sections.push(`QA standards and conventions: ${effectiveStandards.join("; ")}`);
  sections.push(`Company services/products to align with: ${effectiveServices.join("; ")}`);
  sections.push(`Additional company prompt guidance: ${effectiveGuidance}`);

  sections.push(
    "Prioritize terminology, workflows, and risk framing that match this company context.",
  );

  return sections.join("\n");
}
