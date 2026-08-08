export type DepartmentCategory = 
  | 'ROADS_AND_SEWAGE'
  | 'WATER_SUPPLY'
  | 'ELECTRICITY'
  | 'PUBLIC_HEALTH'
  | 'BUILDING_APPROVAL'
  | 'REVENUE_AND_TAX';

export interface RawRtiInput {
  rawText: string;
  language: 'ta' | 'en' | 'mixed';
  audioBlobUrl?: string;
  pincode?: string;
}

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

export interface LintedRtiQuery {
  id: number;
  originalQuery: string;
  lintedQuery: string;
  wasModifiedByLinter: boolean;
  section2fCompliant: boolean;
}

export interface PioInfo {
  id: string;
  district: string;
  localBody: string;
  zoneOrWard: string;
  departmentCategory: DepartmentCategory;
  pioDesignation: string;
  officeAddress: string;
  pincode: string;
  onlineSupported: boolean;
}

export interface VerifiedRtiOutput {
  applicant: {
    name: string;
    address: string;
    pincode: string;
    phone: string;
  };
  publicAuthority: PioInfo;
  subject: string;
  queries: LintedRtiQuery[];
  periodOfInformation: string;
  feeDetails: {
    amount: number;
    mode: 'COURT_FEE_STAMP' | 'POSTAL_ORDER' | 'DEMAND_DRAFT';
  };
  hasSec6_3Clause: boolean;
  portalSanitizedText: string;
  suggestedPdfFilename: string;
  generatedAt: string;
}

export interface IntimationNoticeData {
  rtiReferenceNo: string;
  applicantName: string;
  locationAddress: string;
  sanctionedAmountLakhs: number;
  claimedAmountLakhs: number;
  defectDescription: string;
  contractorWarrantyMonths: number;
  recipientDesignation: string;
  date: string;
}
