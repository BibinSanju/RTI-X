'use client';

import React from 'react';
import StatusWizard from '@/components/StatusWizard';

export default function PreviewTrackerPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans py-10 px-4">
      <div className="w-full max-w-xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Statutory Delay & Escalation Tracker</h1>
          <p className="text-sm text-slate-500 mt-1">SLA Check-in & Automatic Legal Escalation Under Section 6(1)</p>
        </div>
        <StatusWizard
          complaintId="DEMO-SLA-ESCALATION-001"
          initialStatus="PENDING_RTI_SUBMISSION"
        />
      </div>
    </div>
  );
}

