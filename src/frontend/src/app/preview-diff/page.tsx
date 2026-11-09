'use client';

import React from 'react';
import RtiPreview from '@/components/RtiPreview';
import type { VerifiedRtiOutput } from '@/types/rti';

const sampleOutput: VerifiedRtiOutput = {
  applicant: {
    name: "Murugan K.",
    address: "14/2B, Anna Nagar Main Road, Gandhipuram, Ward 24",
    pincode: "641012",
    phone: "+91 98421 54321",
  },
  publicAuthority: {
    designation: "Public Information Officer (PIO)",
    officeAddress: "Coimbatore City Municipal Corporation (CCMC), Big Bazaar Street, Town Hall, Coimbatore",
    district: "Coimbatore",
    pincode: "641001",
    onlineSupported: true,
  },
  subject: "Request for certified public records regarding road repair and contractor warranty for Anna Nagar Main Road under Section 6(1) of the RTI Act, 2005.",
  queries: [
    {
      id: 1,
      originalQuery: "Why has the road near Anna Nagar not been repaired for the last 8 months?",
      lintedQuery: "Please provide certified copies of sanctioned work orders, inspection logs, and administrative delay notes for Anna Nagar Main Road (Ward 24) from July 2024 to February 2025.",
      wasModifiedByLinter: true,
      section2fCompliant: true,
    },
    {
      id: 2,
      originalQuery: "Who is the corrupt contractor and engineer responsible for the broken road?",
      lintedQuery: "Please provide certified copies of the contractor agreement, contract value, designated junior engineer inspection records, and Defect Liability Period (DLP) terms for Anna Nagar Main Road.",
      wasModifiedByLinter: true,
      section2fCompliant: true,
    },
    {
      id: 3,
      originalQuery: "Give me details of all complaints submitted regarding waterlogging and potholes.",
      lintedQuery: "Please provide certified copies of the Citizen Grievance Register and Action Taken Reports (ATR) filed regarding potholes and water stagnation in Ward 24 for the preceding 12 months.",
      wasModifiedByLinter: true,
      section2fCompliant: true,
    }
  ],
  periodOfInformation: "July 2024 – February 2025",
  feeDetails: {
    amount: 10,
    mode: 'COURT_FEE_STAMP',
  },
  hasSec6_3Clause: true,
  generatedAt: new Date().toISOString(),
};

export default function PreviewDiffPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <RtiPreview
        output={sampleOutput}
        onConfirm={() => alert('Confirmed!')}
        onEdit={() => alert('Edit clicked!')}
      />
    </div>
  );
}

