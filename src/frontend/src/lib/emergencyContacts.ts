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
  if (category === 'WATER_SUPPLY') {
    return {
      authorityName: "Metro Water Supply & Sewerage Board",
      sourceURL: "https://chennaimetrowater.tn.gov.in/",
      severityLevel: severity,
      contacts: [
        { id: "mock-w1", title: "Water Supply Helpline", type: "TOLL_FREE", value: "1916" },
        { id: "mock-w2", title: "Chief Engineer (Water)", name: "Mr. Kumar", type: "MOBILE", value: "9876543210" },
        { id: "mock-w3", title: "WhatsApp Complaint Cell", type: "WHATSAPP", value: "9444332200" }
      ]
    };
  } else if (category === 'ELECTRICITY') {
    return {
      authorityName: "Tamil Nadu Generation & Distribution Corp (TANGEDCO)",
      sourceURL: "https://www.tangedco.gov.in/",
      severityLevel: severity,
      contacts: [
        { id: "mock-e1", title: "Electricity Board Helpline", type: "TOLL_FREE", value: "1912" },
        { id: "mock-e2", title: "Superintending Engineer", name: "Mrs. Meena", type: "MOBILE", value: "9876543211" },
        { id: "mock-e3", title: "WhatsApp Complaint Cell", type: "WHATSAPP", value: "9445850811" }
      ]
    };
  } else {
    // ROAD_INFRASTRUCTURE and fallback
    return {
      authorityName: "Road Safety & Infrastructure Authority (Tamil Nadu)",
      sourceURL: "https://highways.tn.gov.in/",
      severityLevel: severity,
      contacts: [
        { id: "mock-1", title: "Emergency Road Repair Helpline", type: "TOLL_FREE", value: "1800-425-1010" },
        { id: "mock-2", title: "Chief Engineer (Highways)", name: "Mr. Rajendran", type: "MOBILE", value: "9867341600" },
        { id: "mock-3", title: "WhatsApp Complaint Cell", type: "WHATSAPP", value: "9444332211" }
      ]
    };
  }
}
