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
    // We mainly want to show emergency banners for HIGH/MEDIUM severity
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

  if (loading) return null; // Don't show anything while loading
  if (!data || data.contacts.length === 0) return null; // No emergency contacts found

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md my-4 shadow-sm animate-pulse-once">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
        </div>
        <div className="ml-3 w-full">
          <h3 className="text-lg font-medium text-red-800">
            Emergency Contact Available: {data.authorityName}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p className="mb-2">
              Based on your issue ({category.replace(/_/g, ' ')}), you can immediately reach out to the authorities while your RTI is being processed:
            </p>
            <ul className="space-y-2 mt-3">
              {data.contacts.map((contact) => (
                <li key={contact.id} className="flex items-center bg-white p-2 rounded border border-red-200 shadow-sm">
                  {contact.type === 'WHATSAPP' && <PhoneForwarded className="w-5 h-5 mr-2 text-green-600" />}
                  {contact.type === 'TOLL_FREE' && <Phone className="w-5 h-5 mr-2 text-blue-600" />}
                  {contact.type === 'EMAIL' && <Mail className="w-5 h-5 mr-2 text-gray-600" />}
                  {(contact.type === 'LANDLINE' || contact.type === 'MOBILE') && <Phone className="w-5 h-5 mr-2 text-gray-800" />}
                  
                  <span className="font-semibold text-gray-900 mr-2">{contact.title}:</span>
                  <a href={contact.type === 'EMAIL' ? `mailto:${contact.value}` : `tel:${contact.value.replace(/\s+/g, '')}`} className="text-blue-700 hover:underline font-bold text-lg">
                    {contact.value}
                  </a>
                  {contact.name && <span className="ml-2 text-xs text-gray-500">({contact.name})</span>}
                </li>
              ))}
            </ul>
          </div>
          {data.sourceURL && (
            <div className="mt-4">
              <a
                href={data.sourceURL}
                target="_blank"
                rel="noreferrer"
                className="text-red-700 hover:text-red-600 font-medium text-sm underline"
              >
                Visit Official Portal
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
