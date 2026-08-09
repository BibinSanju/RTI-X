import React from 'react';
import StatusWizard from '@/components/StatusWizard';
import { FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    id: string;
  };
}

// Ensure the types match what StatusWizard expects
type ComplaintStatus = 
  | 'PENDING_CALL_CONFIRMATION'
  | 'PENDING_RESOLUTION'
  | 'PENDING_REPLY_SLA'
  | 'PENDING_RTI_SUBMISSION'
  | 'RESOLVED'
  | 'DISCARDED';

export default async function UpdateStatusPage({ params }: PageProps) {
  const { id } = params;
  
  // Default fallback status for UI testing
  let initialStatus: ComplaintStatus = 'PENDING_CALL_CONFIRMATION';

  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const res = await fetch(`${API_URL}/api/complaints/${id}`, { cache: 'no-store' });
    
    if (res.ok) {
      const data = await res.json();
      if (data.status) {
        initialStatus = data.status as ComplaintStatus;
      }
    }
  } catch (error) {
    console.warn("Could not fetch status from backend, using fallback status for UI.", error);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* ── Public Service Header (Matching InputWizard) ───────────────── */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-xs">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">RTI Portal</h1>
              <p className="text-xs text-slate-500 leading-none">Citizen Status Tracker</p>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            ID: {id.slice(0, 8)}
          </span>
        </div>
      </header>

      {/* ── Main Content Container ─────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 sm:py-10">
        <StatusWizard complaintId={id} initialStatus={initialStatus} />
      </main>
    </div>
  );
}
