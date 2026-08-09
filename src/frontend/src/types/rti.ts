// src/types/rti.ts
// TypeScript interfaces as specified in ARCHITECTURE_DEEP_DIVE.md §4
// Do NOT modify this file's shapes without syncing with the team architecture doc.

export type DepartmentCategory =
  | 'ROADS_AND_SEWAGE'
  | 'WATER_SUPPLY'
  | 'ELECTRICITY'
  | 'PUBLIC_HEALTH'
  | 'BUILDING_APPROVAL'
  | 'REVENUE_AND_TAX';

export type WizardStep = 'input' | 'processing' | 'review' | 'final';

export type ProcessingStepId =
  | 'recording'
  | 'transcribing'
  | 'understanding'
  | 'resolving';

export type ProcessingStepStatus = 'waiting' | 'active' | 'done' | 'error';

export interface ProcessingStep {
  id: ProcessingStepId;
  label: string;
  labelTa: string;
  status: ProcessingStepStatus;
}

// Raw input from the citizen (voice or text)
export interface RawRtiInput {
  rawText: string;
  language: 'ta' | 'en' | 'mixed';
  audioBlobUrl?: string;
}

// Applicant details collected in Step 1
export interface ApplicantDetails {
  name: string;
  pincode: string;
  phone?: string;
}

// Output from Gemini entity extraction (Anirudhan's route: /api/extract-entities)
export interface ExtractedEntities {
  applicantName: string;
  doorNo: string;
  streetName: string;
  areaOrWard: string;
  pincode: string;
  district: string;
  category: DepartmentCategory;
  rawGrievanceSummary: string;
  draftQueries: string[];
}

// Output from linter.ts (Bibin's deterministic guardrail)
export interface LintedRtiQuery {
  id: number;
  originalQuery: string;
  lintedQuery: string;
  wasModifiedByLinter: boolean;
  section2fCompliant: boolean;
}

// Final compiled RTI output — consumed by RtiPreview and PDF compiler
export interface VerifiedRtiOutput {
  applicant: {
    name: string;
    address: string;
    pincode: string;
    phone: string;
  };
  publicAuthority: {
    name: string;
    designation: string;
    officeAddress: string;
    district: string;
    pincode: string;
    onlineSupported: boolean;
  };
  subject: string;
  queries: LintedRtiQuery[];
  periodOfInformation: string;
  feeDetails: {
    amount: number;
    mode: 'COURT_FEE_STAMP' | 'POSTAL_ORDER' | 'DEMAND_DRAFT';
  };
  hasSec6_3Clause: boolean;
  generatedAt: string;
  extractedEntities?: Partial<ExtractedEntities> & { urgency?: string };
}

export interface IntimationNoticeData {
  rtiReferenceNo: string;
  sanctionedAmountLakhs: number;
  claimedAmountLakhs: number;
  defectDescription: string;
  contractorWarrantyMonths: number;
  recipientDesignation: string;
}
