/**
 * RTI Online Portal Sanitizer & PDF Enforcer Engine (portalSanitizer.ts)
 * Enforces Central/State RTI Online portal rules (rtionline.gov.in / rtionline.tn.gov.in)
 */

const ALLOWED_CHARS_REGEX = /[^A-Za-z0-9\s,\.\-_()\/@:&?\\%]/g;

/**
 * Sanitizes input text to conform to RTI Online Portal character restrictions (3000 char max, whitelisted special chars)
 */
export function sanitizeTextForRtiPortal(rawText: string, maxLength: number = 2800): string {
  // Step 1: Remove unallowed special characters
  let sanitized = rawText.replace(ALLOWED_CHARS_REGEX, '');

  // Step 2: Enforce character count limit
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + " [Text truncated to meet 3000 character RTI portal limit. Full application attached as PDF.]";
  }

  return sanitized;
}

/**
 * Generates space-free PDF filenames as mandated by RTI portal guidelines
 * Example: "Bibin Sanju" + "Madukkarai" -> "Bibin_Sanju_RTI_Madukkarai.pdf"
 */
export function generateSpaceFreePdfFilename(applicantName: string, areaName: string): string {
  const cleanName = applicantName.trim().replace(/[^a-zA-Z0-9]/g, '_');
  const cleanArea = areaName.trim().replace(/[^a-zA-Z0-9]/g, '_');
  
  // Strip duplicate underscores
  const filename = `${cleanName}_RTI_${cleanArea}`.replace(/_+/g, '_');
  
  return `${filename}.pdf`;
}
