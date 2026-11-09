export type DepartmentCategory = 
  | 'ROADS_AND_SEWAGE'
  | 'WATER_SUPPLY'
  | 'ELECTRICITY'
  | 'PUBLIC_HEALTH'
  | 'BUILDING_APPROVAL'
  | 'HIGHWAYS'
  | 'REVENUE_AND_TAX'
  | 'EDUCATION'
  | 'TRANSPORT'
  | 'CIVIL_SUPPLIES'
  | 'HEALTHCARE'
  | 'REGISTRATION'
  | 'GENERAL'
  | 'APPEAL';

export interface PIORecord {
  id: string;
  district: string;
  local_body: string;
  zone_or_ward: string;
  department_category: DepartmentCategory;
  pio_designation: string;
  office_address: string;
  pincode: string;
  online_supported: boolean;
}

export interface PioInfo {
  name?: string;
  designation: string;
  officeAddress: string;
  district?: string;
  pincode?: string;
  onlineSupported?: boolean;
}

export interface ExtractedEntities {
  applicantName?: string;
  doorNo?: string;
  streetName?: string;
  areaOrWard?: string;
  district?: string;
  pincode?: string;
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
  portalSanitizedText?: string;
  suggestedPdfFilename?: string;
  generatedAt: string;
}
