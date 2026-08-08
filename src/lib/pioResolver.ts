import piosData from '../data/pios.json';
import { PIORecord, DepartmentCategory } from '../types/rti.ts';

// Type assertion for imported JSON
const pioDatabase = piosData as PIORecord[];

/**
 * Resolves the correct Public Information Officer based on pincode and department category.
 * Sub-5ms local lookup for the hackathon MVP.
 * 
 * @param pincode - The 6 digit pincode of the issue location (e.g. "641018")
 * @param category - The department category (e.g. "ROADS_AND_SEWAGE")
 * @returns The matching PIORecord or a default fallback PIO if not found.
 */
export function resolvePio(pincode: string, category: DepartmentCategory): PIORecord {
  
  // 1. Try to find an exact match for pincode + category
  const exactMatch = pioDatabase.find(
    (pio) => pio.pincode === pincode && pio.department_category === category
  );
  
  if (exactMatch) {
    return exactMatch;
  }

  // 2. Try to find a match just by category (Fallback to the first available for that category)
  const categoryMatch = pioDatabase.find(
    (pio) => pio.department_category === category
  );

  if (categoryMatch) {
    return categoryMatch;
  }

  // 3. Ultimate Fallback (Default to CCMC Central Zone if totally unknown)
  // In a real app, this would route to a generic District Collector PIO
  return {
    id: 'pio_fallback',
    district: 'Coimbatore',
    local_body: 'Coimbatore District Administration',
    zone_or_ward: 'General',
    department_category: category,
    pio_designation: 'The Public Information Officer',
    office_address: 'District Collectorate, State Bank Road, Coimbatore',
    pincode: '641018',
    online_supported: false
  };
}
