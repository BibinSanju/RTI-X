import pioData from '../data/pios.json';
import { PioInfo, DepartmentCategory } from '../types/rti';

/**
 * Fast sub-5ms Pincode & Ward PIO Resolver (pioResolver.ts)
 * Maps Pincode / Area / Department to the exact PIO Designation & Office Address.
 */
export function resolvePio(
  pincode: string,
  areaOrWard: string = '',
  category: DepartmentCategory = 'ROADS_AND_SEWAGE'
): PioInfo {
  const pios = pioData as PioInfo[];

  // Step 1: Match by exact Pincode + Category
  const exactMatch = pios.find(p => p.pincode === pincode.trim() && p.departmentCategory === category);
  if (exactMatch) return exactMatch;

  // Step 2: Match by Pincode only
  const pincodeMatch = pios.find(p => p.pincode === pincode.trim());
  if (pincodeMatch) return pincodeMatch;

  // Step 3: Match by Area name keyword (e.g. Madukkarai)
  const areaMatch = pios.find(p => 
    areaOrWard.toLowerCase().includes(p.zoneOrWard.toLowerCase()) || 
    p.zoneOrWard.toLowerCase().includes(areaOrWard.toLowerCase())
  );
  if (areaMatch) return areaMatch;

  // Step 4: Fallback to CCMC West Zone default
  return pios[1];
}
