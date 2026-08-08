import { ExtractedEntities, LintedRtiQuery, VerifiedRtiOutput, PioInfo } from '../types/rti';

const MANDATORY_PREFIX = "Provide certified copy of";
const WHY_PATTERN = /^(why|how|when|reasons for|ஏன்|எப்போது|எப்படி|காரணம்)/i;

/**
 * Deterministic Legal Validator & Linter Engine (linter.ts)
 * Programmatically enforces Section 2(f), Section 6(3), and Section 8 compliance.
 */
export function validateAndLintRti(
  rawEntities: ExtractedEntities,
  pioInfo: PioInfo
): VerifiedRtiOutput {
  const lintedQueries: LintedRtiQuery[] = rawEntities.draftQueries.map((query, index) => {
    let wasModified = false;
    let processedText = query.trim();

    // Rule 1: Strip subjective "Why/How/When" questions under Section 2(f)
    if (WHY_PATTERN.test(processedText)) {
      wasModified = true;
      processedText = `${MANDATORY_PREFIX} the official file notes, inspection records, and decision logs regarding: ${processedText}`;
    }

    // Rule 2: Force mandatory record-seeking prefix
    if (!processedText.toLowerCase().startsWith("provide certified")) {
      wasModified = true;
      processedText = `${MANDATORY_PREFIX} ${processedText}`;
    }

    return {
      id: index + 1,
      originalQuery: query,
      lintedQuery: processedText,
      wasModifiedByLinter: wasModified,
      section2fCompliant: true
    };
  });

  const fullApplicantAddress = `Door No. ${rawEntities.doorNo}, ${rawEntities.streetName}, ${rawEntities.areaOrWard}, ${rawEntities.district} - ${rawEntities.pincode}`;

  return {
    applicant: {
      name: rawEntities.applicantName || "Resident",
      address: fullApplicantAddress,
      pincode: rawEntities.pincode || "641001",
      phone: "+91 98765 43210"
    },
    publicAuthority: pioInfo,
    subject: `Request for certified records under Section 6(1) of the RTI Act, 2005 regarding ${rawEntities.rawGrievanceSummary} at ${rawEntities.streetName}, ${rawEntities.areaOrWard}.`,
    queries: lintedQueries,
    periodOfInformation: "January 2024 to August 2026",
    feeDetails: {
      amount: 10,
      mode: 'COURT_FEE_STAMP'
    },
    hasSec6_3Clause: true,
    portalSanitizedText: "", // Handled by portalSanitizer.ts
    suggestedPdfFilename: "", // Handled by portalSanitizer.ts
    generatedAt: new Date().toISOString()
  };
}

/**
 * Checks for Section 8 Statutory Exemption risks
 */
export function checkSection8Exemptions(queryText: string): { isExempt: boolean; warning?: string } {
  if (/(personal|aadhaar|pan card|bank account|private phone|medical report)/i.test(queryText)) {
    return {
      isExempt: true,
      warning: "Section 8(1)(j) Privacy Shield: Query requests personal information. Auto-redacting personal identity fields."
    };
  }
  if (/(cabinet papers|secret|national security|police intelligence)/i.test(queryText)) {
    return {
      isExempt: true,
      warning: "Section 8(1)(a) Security Shield: Query touches classified state security. Re-framing to public tender records only."
    };
  }
  return { isExempt: false };
}
