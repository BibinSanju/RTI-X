'use client';

import React, { useState } from 'react';
import { Search, FileText, Phone, PhoneForwarded } from 'lucide-react';

const mockHelplineData = {
  category: "CIVIL_SUPPLIES",
  contactsData: {
    contacts: [
      {
        id: "pds-1",
        title: "PDS Ration & Essential Commodities Helpline",
        name: "Toll-Free Consumer Grievance Cell",
        value: "1967",
        type: "TOLL_FREE",
      },
      {
        id: "pds-2",
        title: "Consumer Protection National Toll-Free Helpline",
        name: "Department of Consumer Affairs",
        value: "1800-425-5901",
        type: "TOLL_FREE",
      },
      {
        id: "pds-3",
        title: "Taluk Supply Officer (Atur PDS Grievance WhatsApp)",
        name: "District Civil Supplies Officer",
        value: "9445000500",
        type: "WHATSAPP",
      },
    ]
  }
};

export default function PreviewHelplinePage() {
  const [hasAddressedIssue, setHasCalledHelpline] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-xs">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">RTI Portal</h1>
              <p className="text-xs text-slate-500 leading-none">Right to Information Citizen Portal</p>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            Public Service
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 mx-auto flex items-center justify-center shadow-xs">
              <Search className="w-7 h-7 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Let's Try Solving This First!</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              This issue looks like an immediate problem that can be resolved locally without waiting 30 days for a formal RTI.
            </p>
          </div>

          <div className="bg-red-50/70 border border-red-200 border-l-4 border-l-red-500 p-5 rounded-xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-red-900 uppercase tracking-wide">
                Official Immediate Helplines:
              </h3>
              <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                {mockHelplineData.contactsData.contacts.length} Contacts
              </span>
            </div>
            
            <div className="space-y-3">
              {mockHelplineData.contactsData.contacts.map((contact) => (
                <div 
                  key={contact.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white rounded-xl border border-red-200 hover:border-red-300 transition-colors gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="p-2 bg-red-50 text-red-600 rounded-lg shrink-0 mt-0.5">
                      {contact.type === 'WHATSAPP' ? (
                        <PhoneForwarded className="w-4 h-4 text-green-600" />
                      ) : (
                        <Phone className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 leading-snug break-words">
                        {contact.title}
                      </p>
                      {contact.name && (
                        <p className="text-xs text-slate-500 mt-0.5 break-words">
                          {contact.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <a 
                    href={`tel:${contact.value.replace(/\s+/g, '')}`} 
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-sm rounded-lg border border-indigo-200 transition-colors shrink-0"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {contact.value}
                  </a>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                <label className="flex items-center space-x-3 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                    checked={hasAddressedIssue} 
                    onChange={(e) => setHasCalledHelpline(e.target.checked)} 
                  />
                  <span className="text-sm font-medium text-slate-800">
                    I have contacted the helpline or addressed the issue
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              className="w-full min-h-[46px] py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
              onClick={() => alert("Proceed to File Formal RTI clicked")}
            >
              <FileText className="w-4 h-4" />
              Proceed to File Formal RTI (Section 6(1))
            </button>

            <button
              type="button"
              disabled={!hasAddressedIssue}
              className={`w-full min-h-[46px] py-3 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center shadow-xs ${
                !hasAddressedIssue
                  ? 'bg-slate-300 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              Register Ticket
            </button>
            
            <button
              type="button"
              className="w-full py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

