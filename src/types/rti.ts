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
