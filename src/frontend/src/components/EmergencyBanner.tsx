'use client';

import React, { useEffect, useState } from 'react';
import { fetchEmergencyContacts, EmergencyResponse } from '@/lib/emergencyContacts';
import { DepartmentCategory } from '@/types/rti';
import { AlertTriangle, Phone, PhoneForwarded, Mail } from 'lucide-react';

interface EmergencyBannerProps {
  category: DepartmentCategory | string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  pincode?: string;
}

export default function EmergencyBanner({ category, severity, pincode }: EmergencyBannerProps) {
  const [data, setData] = useState<EmergencyResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (severity === 'LOW') {
      setLoading(false);
      return;
    }

    async function loadContacts() {
      setLoading(true);
      const res = await fetchEmergencyContacts(category, severity, pincode);
      setData(res);
      setLoading(false);
    }

    loadContacts();
  }, [category, severity, pincode]);

  if (loading) return null;
  if (!data || data.contacts.length === 0) return null;

  return (
    <div className="bg-red-50/90 border border-red-200 border-l-4 border-l-red-500 p-4 rounded-xl my-3 shadow-xs animate-fade-in-up">
      <div className="flex items-start gap-3">
        <div className="p-1.5 bg-red-100 rounded-lg text-red-600 flex-shrink-0 mt-0.5">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-red-900 leading-snug">
              Emergency Contact Available: {data.authorityName}
            </h3>
            {data.sourceURL && (
              <a
                href={data.sourceURL}
                target="_blank"
                rel="noreferrer"
                className="text-red-700 hover:text-red-800 text-xs font-semibold underline"
              >
                Official Portal ↗
              </a>
            )}
          </div>
          <p className="text-xs text-red-700 mt-1 leading-relaxed">
            You can reach out to these official helplines immediately while your RTI application is prepared:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3">
            {data.contacts.map((contact) => (
              <div 
                key={contact.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between bg-white px-3 py-2.5 rounded-lg border border-red-200 shadow-2xs gap-2 min-w-0"
              >
                <div className="flex items-start sm:items-center gap-2 min-w-0">
                  {contact.type === 'WHATSAPP' && <PhoneForwarded className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5 sm:mt-0" />}
                  {contact.type === 'TOLL_FREE' && <Phone className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />}
                  {contact.type === 'EMAIL' && <Mail className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5 sm:mt-0" />}
                  {(contact.type === 'LANDLINE' || contact.type === 'MOBILE') && <Phone className="w-3.5 h-3.5 text-slate-700 flex-shrink-0 mt-0.5 sm:mt-0" />}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 leading-snug break-words">{contact.title}</p>
                    {contact.name && <p className="text-[11px] text-slate-500 break-words">{contact.name}</p>}
                  </div>
                </div>
                <a 
                  href={contact.type === 'EMAIL' ? `mailto:${contact.value}` : `tel:${contact.value.replace(/\s+/g, '')}`} 
                  className="text-indigo-700 hover:text-indigo-800 hover:underline font-bold text-xs whitespace-nowrap bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 shrink-0 self-start sm:self-auto"
                >
                  {contact.value}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
