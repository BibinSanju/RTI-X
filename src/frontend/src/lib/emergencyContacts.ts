import { DepartmentCategory } from '@/types/rti';

export interface EmergencyContact {
  id: string; // The extra ID field added by the backend
  title: string;
  type: 'TOLL_FREE' | 'WHATSAPP' | 'LANDLINE' | 'MOBILE' | 'EMAIL';
  value: string;
  name?: string; // Optional name of the person
}

export interface EmergencyResponse {
  authorityName: string;
  contacts: EmergencyContact[];
  sourceURL?: string;
  severityLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Raw flat object returned by the backend (matches SQLAlchemy model: EmergencyHelpline)
 */
export interface RawEmergencyHelpline {
  id: string;
  authority_name: string;
  department_category: string;
  zone_or_ward?: string | null;
  contact_title: string;
  contact_name?: string | null;
  contact_type: 'TOLL_FREE' | 'WHATSAPP' | 'LANDLINE' | 'MOBILE' | 'EMAIL';
  contact_value: string;
  source_url?: string | null;
  verified_at?: string | null;
  created_at: string;
}

/**
 * Fetches emergency contacts based on the AI classification (Category + Severity)
 * and location (Pincode/Zone).
 * 
 * NOTE: This currently hits a mock endpoint or simulates the backend response.
 * Once the backend is ready, this will hit: GET /api/emergency-contacts
 */
export async function fetchEmergencyContacts(
  category: DepartmentCategory | string,
  severity: 'HIGH' | 'MEDIUM' | 'LOW',
  pincode?: string
): Promise<EmergencyResponse | null> {
  // If it's not a HIGH severity, maybe we don't need to show emergency numbers,
  // but let's fetch them anyway just in case the backend wants to return portal links.
  
  try {
    const res = await fetch(`/api/emergency-contacts?category=${category}&zone=${pincode || ''}`);
    
    if (!res.ok) {
      console.warn("Backend /api/emergency-contacts failed, falling back to mock");
      throw new Error("Backend failed");
    }

    const rawData: RawEmergencyHelpline[] = await res.json();
    
    if (rawData && rawData.length > 0) {
      // Map flat database rows into our nested UI structure
      return {
        authorityName: rawData[0].authority_name,
        sourceURL: rawData[0].source_url || undefined,
        severityLevel: severity,
        contacts: rawData.map(row => ({
          id: row.id,
          title: row.contact_title,
          name: row.contact_name || undefined,
          type: row.contact_type,
          value: row.contact_value
        }))
      };
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch emergency contacts from DB/Render:", error);
    // Strict DB reliance. If DB fails or is empty, we return null.
    // No hardcoded numbers allowed per user request.
    return null;
  }
}
