"use client";

import React, { useState } from 'react';
import { CheckCircle2, XCircle, Copy, ExternalLink, AlertTriangle, Loader2 } from 'lucide-react';

// Fallback mock RTI draft
const MOCK_RTI_DRAFT = `To,
The Public Information Officer (PIO)
Coimbatore City Municipal Corporation

Subject: Application under Right to Information Act, 2005

Dear Sir/Madam,
I request you to provide the following information regarding my unresolved civic complaint filed on [Date] regarding [Issue].
1. Please state the reason for the delay in resolving this issue.
2. Please provide the details of the official responsible for this delay.

Thank you.`;

export type ComplaintStatus = 
  | 'PENDING_CALL_CONFIRMATION'
  | 'PENDING_RESOLUTION'
  | 'PENDING_REPLY_SLA'
  | 'PENDING_RTI_SUBMISSION'
  | 'RESOLVED'
  | 'DISCARDED';

interface StatusWizardProps {
  complaintId: string;
  initialStatus: ComplaintStatus;
}

export default function StatusWizard({ complaintId, initialStatus }: StatusWizardProps) {
  const [status, setStatus] = useState<ComplaintStatus>(initialStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const handleApiCall = async (endpoint: string, payload: any, nextStatus: ComplaintStatus, msg: string) => {
    setIsSubmitting(true);
    try {
      await fetch(`${API_URL}/api/complaints/${complaintId}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(err => console.warn("Backend not reachable, continuing in UI mode...", err));
      
      await new Promise(r => setTimeout(r, 600));
      
      if (nextStatus === 'RESOLVED') setSuccessMessage(msg);
      setStatus(nextStatus);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(MOCK_RTI_DRAFT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'PENDING_CALL_CONFIRMATION':
        return (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4 text-center">
              <h2 className="text-xl font-bold text-slate-900">Did the officer answer your call?</h2>
              <p className="text-sm text-slate-500 mt-1">
                Your complaint was routed to the verified government official.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button 
                onClick={() => handleApiCall('call-status', { answered: true }, 'PENDING_RESOLUTION', '')}
                disabled={isSubmitting}
                className="flex-1 min-h-[44px] px-6 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" /> Yes, they answered
              </button>
              <button 
                onClick={() => handleApiCall('call-status', { answered: false }, 'PENDING_REPLY_SLA', '')}
                disabled={isSubmitting}
                className="flex-1 min-h-[44px] px-6 py-3 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <XCircle className="w-4 h-4 text-slate-400" /> No, no reply
              </button>
            </div>
          </div>
        );

      case 'PENDING_RESOLUTION':
        return (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4 text-center">
              <h2 className="text-xl font-bold text-slate-900">Is the problem cleared?</h2>
              <p className="text-sm text-indigo-600 font-medium bg-indigo-50 mt-3 py-2 px-4 rounded-lg inline-block">
                The officer committed to resolving this. Let's hold them accountable.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button 
                onClick={() => handleApiCall('resolution-status', { cleared: true }, 'RESOLVED', 'Fantastic! The issue is legally resolved.')}
                disabled={isSubmitting}
                className="flex-1 min-h-[44px] px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" /> Yes, it's fixed!
              </button>
              <button 
                onClick={() => handleApiCall('resolution-status', { cleared: false }, 'PENDING_RTI_SUBMISSION', '')}
                disabled={isSubmitting}
                className="flex-1 min-h-[44px] px-6 py-3 bg-white border border-red-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <XCircle className="w-4 h-4" /> No, still broken
              </button>
            </div>
          </div>
        );

      case 'PENDING_REPLY_SLA':
        return (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4 text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                 <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">48 Hour Check-in</h2>
              <p className="text-sm text-slate-500 mt-1">Did the official finally reply or address the complaint?</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button 
                onClick={() => handleApiCall('resolution-status', { cleared: true, replied: true }, 'RESOLVED', 'Great! SLA fulfilled successfully.')}
                disabled={isSubmitting}
                className="flex-1 min-h-[44px] px-6 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" /> Yes, they fixed it
              </button>
              <button 
                onClick={() => handleApiCall('resolution-status', { cleared: false, replied: false }, 'PENDING_RTI_SUBMISSION', '')}
                disabled={isSubmitting}
                className="flex-1 min-h-[44px] px-6 py-3 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                 Escalate to RTI
              </button>
            </div>
          </div>
        );

      case 'PENDING_RTI_SUBMISSION':
        return (
          <div className="space-y-6 w-full max-w-lg mx-auto">
             <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center shadow-xs">
                <h2 className="text-lg font-bold text-red-900 mb-1">RTI Escalation Triggered</h2>
                <p className="text-slate-600 text-xs mb-4">Because the government failed their SLA, we have drafted a legal Right to Information application for you.</p>
                
                <div className="bg-white rounded-lg p-3 text-left border border-slate-200 relative group overflow-hidden h-32 mb-4 shadow-inner">
                  <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />
                  <pre className="text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">
                    {MOCK_RTI_DRAFT}
                  </pre>
                </div>

                <div className="flex flex-col gap-3">
                    <button 
                        onClick={copyToClipboard}
                        className={`w-full min-h-[44px] px-6 py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs border ${copied ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                    >
                        {copied ? <><CheckCircle2 className="w-4 h-4" /> Copied to Clipboard!</> : <><Copy className="w-4 h-4" /> Copy RTI Draft</>}
                    </button>
                    <a 
                        href="https://rtionline.gov.in/" 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full min-h-[44px] px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-xs"
                    >
                        Open Govt Portal <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
             </div>

             <div className="pt-4 border-t border-slate-200 text-center">
                 <p className="text-slate-700 text-sm font-medium mb-3">Did you submit the RTI form?</p>
                 <div className="flex gap-3 justify-center">
                    <button 
                        onClick={() => handleApiCall('rti-status', { submitted: true }, 'RESOLVED', 'RTI Logged! We will track the 30-day legal deadline.')}
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-xs"
                    >
                        Yes, Submitted
                    </button>
                    <button 
                        onClick={() => setStatus('DISCARDED')}
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-lg transition-colors shadow-xs"
                    >
                        Will do later
                    </button>
                 </div>
             </div>
          </div>
        );

      case 'RESOLVED':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Case Closed</h2>
            <p className="text-emerald-700 text-sm font-medium">{successMessage}</p>
          </div>
        );

      case 'DISCARDED':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
               <XCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Track Paused</h2>
            <p className="text-slate-500 text-sm">You can return here anytime using your Magic Link.</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-10 shadow-xs">
        {isSubmitting ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-12">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-slate-600 text-sm font-medium">Updating Government Ledger...</p>
            </div>
        ) : (
            renderContent()
        )}
    </div>
  );
}
