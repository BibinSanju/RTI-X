/**
 * src/lib/mockApi.ts
 *
 * ⚠️  MOCK DATA LAYER — FOR FRONTEND DEVELOPMENT ONLY ⚠️
 *
 * This file provides fake API responses so the UI can be developed and tested
 * independently before Anirudhan's backend routes (/api/transcribe, /api/extract-entities)
 * and Bibin's linter.ts are ready.
 *
 * TO REPLACE WITH REAL API:
 *   - In InputWizard.tsx, change:
 *       import { mockExtractAndLint, mockResolvePio } from '@/lib/mockApi'
 *     to the real fetch calls.
 *   - Delete this file once real APIs are integrated.
 *
 * DO NOT call these functions from any non-UI code path.
 */

import type {
  ExtractedEntities,
  LintedRtiQuery,
  VerifiedRtiOutput,
} from '@/types/rti';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


// ---------------------------------------------------------------------------
// Mock 2: Gemini entity extraction + linter combined
// Replaces: POST /api/extract-entities  (Anirudhan) + linter.ts (Bibin)
// ---------------------------------------------------------------------------
export async function mockExtractAndLint(
  rawText: string
): Promise<{ entities: ExtractedEntities; lintedQueries: LintedRtiQuery[] }> {
  await delay(1800);

  const entities: ExtractedEntities = {
    applicantName: '',
    doorNo: '13/240',
    streetName: 'Nehru Street',
    areaOrWard: 'Gandhipuram',
    pincode: '641012',
    district: 'Coimbatore',
    category: 'ROADS_AND_SEWAGE',
    rawGrievanceSummary:
      rawText ||
      'Road near my house has been in bad condition for 6 months. ' +
        'Multiple potholes and stagnant rainwater near Nehru Street, Gandhipuram.',
    draftQueries: [
      'Why is the road not repaired for 6 months?',
      'Who is responsible for road maintenance in Gandhipuram?',
      'Provide records of complaints filed regarding Nehru Street potholes.',
    ],
  };

  // Simulated linter.ts output — strips "Why/How" and enforces Section 2(f)
  const lintedQueries: LintedRtiQuery[] = [
    {
      id: 1,
      originalQuery: 'Why is the road not repaired for 6 months?',
      lintedQuery:
        'Provide certified copy of road maintenance work orders, inspection reports, and logbooks for Nehru Street, Gandhipuram, Coimbatore for the period January 2025 to July 2025.',
      wasModifiedByLinter: true,
      section2fCompliant: true,
    },
    {
      id: 2,
      originalQuery:
        'Who is responsible for road maintenance in Gandhipuram?',
      lintedQuery:
        'Provide certified copy of sanctioned departmental jurisdiction chart and designated officer list for road maintenance in Gandhipuram Ward, Coimbatore City Municipal Corporation (CCMC).',
      wasModifiedByLinter: true,
      section2fCompliant: true,
    },
    {
      id: 3,
      originalQuery:
        'Provide records of complaints filed regarding Nehru Street potholes.',
      lintedQuery:
        'Provide certified copy of all written complaints, grievance registration records, and action-taken reports filed regarding road condition and potholes on Nehru Street, Gandhipuram, for the period January 2025 to July 2025.',
      wasModifiedByLinter: false,
      section2fCompliant: true,
    },
  ];

  return { entities, lintedQueries };
}

// ---------------------------------------------------------------------------
// Mock 3: PIO authority resolver
// Replaces: src/lib/pioResolver.ts  (Dharshini)
// ---------------------------------------------------------------------------
/* eslint-disable @typescript-eslint/no-unused-vars */
export async function mockResolvePio(
  _pincode: string,
  _category: string
): Promise<VerifiedRtiOutput['publicAuthority']> {
  await delay(600);
  return {
    name: 'Coimbatore City Municipal Corporation (CCMC)',
    designation: 'Public Information Officer & Executive Engineer (Roads)',
    officeAddress:
      'Coimbatore City Municipal Corporation, Ripon Buildings, Coimbatore — 641 001',
    district: 'Coimbatore',
    pincode: '641001',
    onlineSupported: false, // CCMC requires physical post
  };
}
/* eslint-enable @typescript-eslint/no-unused-vars */

// ---------------------------------------------------------------------------
// Mock 4: Full VerifiedRtiOutput assembly
// Replaces: server-side assembly in InputWizard after all APIs resolve
// ---------------------------------------------------------------------------
export function assembleMockOutput(
  applicantName: string,
  applicantPincode: string,
  entities: ExtractedEntities,
  lintedQueries: LintedRtiQuery[],
  publicAuthority: VerifiedRtiOutput['publicAuthority']
): VerifiedRtiOutput {
  return {
    applicant: {
      name: applicantName || entities.applicantName || 'Citizen Applicant',
      address: `${entities.doorNo}, ${entities.streetName}, ${entities.areaOrWard}`,
      pincode: applicantPincode || entities.pincode,
      phone: '',
    },
    publicAuthority,
    subject: `RTI Application regarding ${entities.category.replace(/_/g, ' ')} issues at ${entities.areaOrWard}, ${entities.district}`,
    queries: lintedQueries,
    periodOfInformation: 'January 2025 to July 2025',
    feeDetails: {
      amount: 10,
      mode: 'COURT_FEE_STAMP',
    },
    hasSec6_3Clause: true,
    generatedAt: new Date().toISOString(),
  };
}
