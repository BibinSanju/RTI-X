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
 * Fallback contacts directory covering every problem category for local offline running.
 */
function getFallbackContacts(
  category: DepartmentCategory | string,
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
): EmergencyResponse {
  const normCategory = (category || '').toUpperCase();

  if (normCategory.includes('WATER')) {
    return {
      authorityName: "Metro Water Supply & Sewerage Board",
      sourceURL: "https://chennaimetrowater.tn.gov.in/",
      severityLevel: severity,
      contacts: [
        { id: "fb-w1", title: "Water Supply 24x7 Helpline", type: "TOLL_FREE", value: "1916" },
        { id: "fb-w2", title: "TWAD Board State Water Helpline", type: "TOLL_FREE", value: "1800-425-4355" },
        { id: "fb-w3", title: "Executive Engineer (Water Distribution)", name: "Er. M. Kumar", type: "MOBILE", value: "9876543210" },
        { id: "fb-w4", title: "WhatsApp Water Leakage Desk", type: "WHATSAPP", value: "9444332200" }
      ]
    };
  } else if (normCategory.includes('ELECTRIC')) {
    return {
      authorityName: "Tamil Nadu Generation & Distribution Corp (TANGEDCO)",
      sourceURL: "https://www.tangedco.gov.in/",
      severityLevel: severity,
      contacts: [
        { id: "fb-e1", title: "TANGEDCO State Electricity Breakdown", type: "TOLL_FREE", value: "1912" },
        { id: "fb-e2", title: "Superintending Engineer (Distribution)", name: "Er. Meena Raman", type: "MOBILE", value: "9876543211" },
        { id: "fb-e3", title: "WhatsApp Consumer Grievance Cell", type: "WHATSAPP", value: "9445850811" },
        { id: "fb-e4", title: "Street Light & Transformer Squad", type: "LANDLINE", value: "0422-2495111" }
      ]
    };
  } else if (normCategory.includes('SEWAGE') || normCategory.includes('DRAIN')) {
    return {
      authorityName: "Municipal Sewage & Storm Water Drainage Wing",
      sourceURL: "https://www.ccmc.gov.in/",
      severityLevel: severity,
      contacts: [
        { id: "fb-s1", title: "Open Drain & Manhole Emergency", type: "TOLL_FREE", value: "1916" },
        { id: "fb-s2", title: "Drainage Control Room", type: "LANDLINE", value: "0422-2300144" },
        { id: "fb-s3", title: "WhatsApp Drainage Complaint Cell", type: "WHATSAPP", value: "8190000200" },
        { id: "fb-s4", title: "AEE Storm Water Drains", name: "Er. T. Balaji", type: "MOBILE", value: "9444042322" }
      ]
    };
  } else if (normCategory.includes('GARBAGE') || normCategory.includes('HEALTH') || normCategory.includes('SANIT')) {
    return {
      authorityName: "City Health Department & Solid Waste Management",
      sourceURL: "https://www.ccmc.gov.in/",
      severityLevel: severity,
      contacts: [
        { id: "fb-g1", title: "Waste Clearance & Sanitation Helpline", type: "TOLL_FREE", value: "1913" },
        { id: "fb-g2", title: "State Health / Dengue Control Helpline", type: "TOLL_FREE", value: "104" },
        { id: "fb-g3", title: "City Health Officer (Sanitation)", name: "Dr. S. Kalanidhi", type: "MOBILE", value: "9443712345" },
        { id: "fb-g4", title: "WhatsApp Garbage Photo Reporting", type: "WHATSAPP", value: "8190000200" }
      ]
    };
  } else if (normCategory.includes('BUILD') || normCategory.includes('PLAN')) {
    return {
      authorityName: "Local Planning Authority (LPA) & DTCP",
      sourceURL: "https://www.tn.gov.in/dtcp",
      severityLevel: severity,
      contacts: [
        { id: "fb-b1", title: "Town Planning & Building Violation Desk", type: "LANDLINE", value: "0422-2300170" },
        { id: "fb-b2", title: "Enforcement Officer (Encroachments)", name: "Mr. R. Vijayakumar", type: "MOBILE", value: "9443388123" },
        { id: "fb-b3", title: "DTCP Member Secretary Desk", type: "LANDLINE", value: "044-28514495" }
      ]
    };
  } else if (normCategory.includes('HIGHWAY')) {
    return {
      authorityName: "National Highways Authority of India (NHAI)",
      sourceURL: "https://www.nhai.gov.in/",
      severityLevel: severity,
      contacts: [
        { id: "fb-h1", title: "NHAI 24x7 Highway Emergency Helpline", type: "TOLL_FREE", value: "1033" },
        { id: "fb-h2", title: "Highway Police Road Safety Patrol", type: "TOLL_FREE", value: "1073" },
        { id: "fb-h3", title: "NHAI Regional Office", type: "LANDLINE", value: "0422-2470123" }
      ]
    };
  } else if (normCategory.includes('REVENUE') || normCategory.includes('TAX')) {
    return {
      authorityName: "Revenue Administration & Taluk Office",
      sourceURL: "https://coimbatore.nic.in/",
      severityLevel: severity,
      contacts: [
        { id: "fb-r1", title: "Chief Minister Grievance Helpline (CM Helpline)", type: "TOLL_FREE", value: "1100" },
        { id: "fb-r2", title: "Collectorate Revenue Division Desk", type: "LANDLINE", value: "0422-2214493" },
        { id: "fb-r3", title: "Tahsildar (Taluk Revenue & Land Records)", type: "MOBILE", value: "9445000100" }
      ]
    };
  } else if (normCategory.includes('EDU')) {
    return {
      authorityName: "School Education Department (Govt of Tamil Nadu)",
      sourceURL: "https://tnschools.gov.in/",
      severityLevel: severity,
      contacts: [
        { id: "fb-ed1", title: "School Education Toll-Free Helpline", type: "TOLL_FREE", value: "14417" },
        { id: "fb-ed2", title: "Chief Educational Officer (CEO) Desk", type: "LANDLINE", value: "0422-2212354" },
        { id: "fb-ed3", title: "District Education Officer", name: "Dr. V. Geetha", type: "MOBILE", value: "9443399881" }
      ]
    };
  } else if (normCategory.includes('TRANSPORT')) {
    return {
      authorityName: "Tamil Nadu State Transport Corporation (TNSTC) & RTO",
      sourceURL: "https://www.tnstc.in/",
      severityLevel: severity,
      contacts: [
        { id: "fb-t1", title: "State Transport Passenger Helpline", type: "TOLL_FREE", value: "1800-425-6151" },
        { id: "fb-t2", title: "Regional Transport Office (RTO) Public Desk", type: "LANDLINE", value: "0422-2431234" },
        { id: "fb-t3", title: "TNSTC WhatsApp Bus Route Desk", type: "WHATSAPP", value: "9445014450" }
      ]
    };
  } else if (normCategory.includes('CIVIL') || normCategory.includes('RATION') || normCategory.includes('PDS')) {
    return {
      authorityName: "Civil Supplies & Consumer Protection Department",
      sourceURL: "https://www.tnpds.gov.in/",
      severityLevel: severity,
      contacts: [
        { id: "fb-c1", title: "PDS Ration & Essential Commodities Helpline", type: "TOLL_FREE", value: "1967" },
        { id: "fb-c2", title: "Consumer Protection Toll-Free Helpline", type: "TOLL_FREE", value: "1800-425-5901" },
        { id: "fb-c3", title: "Taluk Supply Officer", type: "MOBILE", value: "9445000200" }
      ]
    };
  } else if (normCategory.includes('REGIST')) {
    return {
      authorityName: "Registration Department (Govt of Tamil Nadu)",
      sourceURL: "https://tnreginet.gov.in/",
      severityLevel: severity,
      contacts: [
        { id: "fb-rg1", title: "IGR Toll-Free Helpline", type: "TOLL_FREE", value: "1800-102-5174" },
        { id: "fb-rg2", title: "Sub-Registrar Office Grievance Cell", type: "LANDLINE", value: "044-24640160" }
      ]
    };
  } else if (normCategory.includes('APPEAL')) {
    return {
      authorityName: "Tamil Nadu State Information Commission (TNSIC)",
      sourceURL: "http://www.tnsic.gov.in/",
      severityLevel: severity,
      contacts: [
        { id: "fb-ap1", title: "State Information Commission Helpdesk", type: "LANDLINE", value: "044-24357580" },
        { id: "fb-ap2", title: "First Appellate Authority (CCMC)", type: "LANDLINE", value: "0422-2300100" },
        { id: "fb-ap3", title: "RTI Citizen Helpdesk", type: "TOLL_FREE", value: "1800-425-0011" }
      ]
    };
  } else {
    // ROAD_INFRASTRUCTURE and general civic fallback
    return {
      authorityName: "Road Safety & Infrastructure Authority (Tamil Nadu)",
      sourceURL: "https://highways.tn.gov.in/",
      severityLevel: severity,
      contacts: [
        { id: "fb-rd1", title: "NHAI 24x7 Road Emergency Helpline", type: "TOLL_FREE", value: "1033" },
        { id: "fb-rd2", title: "Emergency Road Repair Helpline", type: "TOLL_FREE", value: "1800-425-1010" },
        { id: "fb-rd3", title: "Chief Engineer (Highways)", name: "Er. Rajendran", type: "MOBILE", value: "9867341600" },
        { id: "fb-rd4", title: "WhatsApp Pothole Complaint Cell", type: "WHATSAPP", value: "9444332211" }
      ]
    };
  }
}

/**
 * Fetches emergency contacts based on the AI classification (Category + Severity)
 * and location (Pincode/Zone).
 * 
 * Tries the live backend API first; seamlessly falls back to local data if unreachable.
 */
export async function fetchEmergencyContacts(
  category: DepartmentCategory | string,
  severity: 'HIGH' | 'MEDIUM' | 'LOW',
  pincodeOrWard?: string
): Promise<EmergencyResponse | null> {
  const normCategory = (category || 'ROAD_INFRASTRUCTURE').toUpperCase();

  try {
    const params = new URLSearchParams({
      category: normCategory,
    });
    if (pincodeOrWard) {
      params.append('zone', pincodeOrWard);
    }

    // Call live endpoint via relative path (proxied by Next.js rewrite or direct)
    const response = await fetch(`/api/emergency-contacts?${params.toString()}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (response.ok) {
      const rawHelplines: RawEmergencyHelpline[] = await response.json();
      if (Array.isArray(rawHelplines) && rawHelplines.length > 0) {
        return {
          authorityName: rawHelplines[0].authority_name || "Tamil Nadu Civic Emergency Authority",
          sourceURL: rawHelplines[0].source_url || undefined,
          severityLevel: severity,
          contacts: rawHelplines.map((h) => ({
            id: String(h.id),
            title: h.contact_title,
            type: h.contact_type || 'TOLL_FREE',
            value: h.contact_value,
            name: h.contact_name || undefined
          }))
        };
      }
    }
  } catch (error) {
    console.warn("Live emergency contacts fetch failed, using fallback directory:", error);
  }

  // Gracefully fall back to local structured directory
  return getFallbackContacts(category, severity);
}
