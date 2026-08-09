import React from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const DUMMY_USER_ID = "63093b8d-cf41-4c74-af99-9e09a4d1f616";

export default async function DashboardPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  let complaints = [];
  
  try {
    const res = await fetch(`${API_URL}/api/complaints/user/${DUMMY_USER_ID}`, { cache: 'no-store' });
    if (res.ok) {
      complaints = await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch dashboard data", err);
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Complaints</h1>
        <p className="text-slate-500 mb-8">Track the status of your civic issues and RTI requests.</p>
        
        {complaints.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
            <p className="text-slate-500">You haven't submitted any complaints yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {complaints.map((c: any) => (
              <Link key={c.id} href={`/update-status/${c.id}`}>
                <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{c.department_category.replace(/_/g, ' ')}</h3>
                    <p className="text-sm text-slate-500 mt-1">{new Date(c.created_at).toLocaleDateString()}</p>
                    <p className="text-sm text-slate-600 mt-2 truncate max-w-md">{c.problem_description || 'No description provided'}</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                    {c.status.replace(/_/g, ' ')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
