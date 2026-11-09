'use client';

/**
 * RtiPreview.tsx
 * Deepan Kumar E S — Neural Ninjas (TEAM-008)
 *
 * Interactive Legal Review screen.
 * Shows side-by-side: original citizen complaint (left) vs. linted RTI queries (right).
 * Allows inline editing of linted queries before confirmation.
 *
 * Props:
 *   output          — VerifiedRtiOutput (assembled by InputWizard)
 *   onConfirm(out)  — called with (possibly edited) output when citizen confirms
 *   onEdit()        — called when citizen wants to go back and change input
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Edit3,
  ChevronRight,
  ArrowLeft,
  Building2,
  FileText,
  Landmark,
  Globe,
  Mail,
} from 'lucide-react';
import type { LintedRtiQuery, VerifiedRtiOutput } from '@/types/rti';

interface RtiPreviewProps {
  output: VerifiedRtiOutput;
  onConfirm: (out: VerifiedRtiOutput) => void;
  onEdit: () => void;
}

// ─── Helper: Validation badges ────────────────────────────────────────────────
interface BadgeProps {
  ok: boolean;
  label: string;
  warningLabel?: string;
}

function ValidationBadge({ ok, label, warningLabel }: BadgeProps) {
  return ok ? (
    <span className="badge-success">
      <CheckCircle2 className="w-3.5 h-3.5" />
      {label}
    </span>
  ) : (
    <span className="badge-warning">
      <AlertTriangle className="w-3.5 h-3.5" />
      {warningLabel ?? label}
    </span>
  );
}

// ─── Helper: single query row ─────────────────────────────────────────────────
interface QueryRowProps {
  query: LintedRtiQuery;
  isEditing: boolean;
  onChange: (newText: string) => void;
}

function QueryRow({ query, isEditing, onChange }: QueryRowProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 animate-fade-in-up overflow-hidden break-words shadow-2xs">
      {/* Query number + compliance badge */}
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center mt-0.5">
          {query.id}
        </span>
        <div className="flex-1 min-w-0 space-y-2">
          {/* If linter modified: show original */}
          {query.wasModifiedByLinter && (
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Original Citizen Input
              </p>
              <p className="text-sm text-slate-500 line-through leading-relaxed break-words whitespace-pre-line font-sans">
                {query.originalQuery}
              </p>
            </div>
          )}

          {/* Linted query — editable when isEditing */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            {query.wasModifiedByLinter && (
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                RTI-GPT Section 2(f) Validated Request
              </p>
            )}
            {isEditing ? (
              <textarea
                className="w-full px-3.5 py-2.5 bg-white border border-indigo-300 rounded-lg text-sm text-slate-900 leading-relaxed font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[140px] resize-y break-words whitespace-pre-line"
                value={query.lintedQuery}
                onChange={(e) => onChange(e.target.value)}
                rows={6}
              />
            ) : (
              <p className="text-sm text-slate-800 leading-relaxed break-words whitespace-pre-line font-sans">
                {query.lintedQuery}
              </p>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 pt-1">
            <ValidationBadge
              ok={query.section2fCompliant}
              label="Section 2(f) compliant"
              warningLabel="Needs Section 2(f) review"
            />
            {query.wasModifiedByLinter && (
              <span className="badge-warning">
                <Edit3 className="w-3.5 h-3.5" />
                AI-corrected
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RtiPreview({ output, onConfirm, onEdit }: RtiPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [queries, setQueries] = useState<LintedRtiQuery[]>(output.queries);

  const modifiedCount = queries.filter((q) => q.wasModifiedByLinter).length;
  const allCompliant = queries.every((q) => q.section2fCompliant);
  const hasAuthority = !!output.publicAuthority?.name;

  const handleQueryChange = (id: number, newText: string) => {
    setQueries((prev) =>
      prev.map((q) => (q.id === id ? { ...q, lintedQuery: newText } : q))
    );
  };

  const handleConfirm = () => {
    onConfirm({ ...output, queries });
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="text-center space-y-1.5 px-4">
        <h2 className="text-2xl font-bold text-slate-900">
          Review Your RTI Application
        </h2>
        <p className="text-sm text-slate-500">
          RTI-GPT has converted your complaint into a legally valid public records request.
          <br />
          <span className="text-tamil text-xs text-slate-400 mt-1 inline-block">
            உங்கள் புகாரை சட்டப்பூர்வ கோரிக்கையாக மாற்றியுள்ளோம்.
          </span>
        </p>
      </div>

      {/* ── Validation Summary Strip ────────────────────────────────────── */}
      <div className="card p-4 flex flex-wrap gap-2.5 justify-center items-center shadow-2xs">
        <ValidationBadge ok={true} label="Record-based request" />
        <ValidationBadge
          ok={allCompliant}
          label="Section 2(f) validated"
          warningLabel="Section 2(f) needs review"
        />
        <ValidationBadge
          ok={hasAuthority}
          label="Authority identified"
          warningLabel="Authority not found"
        />
        {modifiedCount > 0 && (
          <span className="badge-warning">
            <Edit3 className="w-3.5 h-3.5" />
            {modifiedCount} quer{modifiedCount === 1 ? 'y' : 'ies'} AI-corrected
          </span>
        )}
        {output.hasSec6_3Clause && (
          <span className="badge-info">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Sec 6(3) transfer clause included
          </span>
        )}
      </div>

      {/* ── Two-Column Content: Complaint vs RTI Request ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT: Original Complaint (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Your Complaint
            </h3>
          </div>

          <div className="complaint-card min-h-[140px] space-y-2 overflow-hidden break-words">
            {output.applicant.address && (
              <span className="text-xs text-amber-800/80 font-medium block">
                📍 {output.applicant.address}, {output.publicAuthority?.district}
              </span>
            )}
            <p className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
              Original Citizen Grievance
            </p>
            <p className="text-sm text-slate-800 leading-relaxed break-words whitespace-pre-line font-sans">
              {output.queries[0]?.originalQuery || output.subject}
            </p>
          </div>

          {/* Applicant card */}
          <div className="card p-4 space-y-2 shadow-2xs">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Applicant Details
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {output.applicant.name || 'Not provided'}
            </p>
            <p className="text-sm text-slate-600 break-words">{output.applicant.address}</p>
            <p className="text-sm text-slate-600">Pincode: {output.applicant.pincode}</p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Court Fee: ₹{output.feeDetails.amount}</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-[11px] text-slate-600">
                {output.feeDetails.mode.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: RTI-GPT Legal Queries (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                RTI-GPT Request
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing((v) => !v)}
              className={[
                'flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-150',
                isEditing
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              ].join(' ')}
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEditing ? 'Editing…' : 'Edit'}
            </button>
          </div>

          {/* Subject */}
          <div className="linted-card space-y-1.5 overflow-hidden break-words">
            <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
              Subject
            </p>
            {isEditing ? (
              <input
                type="text"
                className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                defaultValue={output.subject}
              />
            ) : (
              <p className="text-sm text-slate-800 font-medium leading-relaxed break-words">
                {output.subject}
              </p>
            )}
          </div>

          {/* Queries list */}
          <div className="space-y-4">
            {queries.map((q) => (
              <QueryRow
                key={q.id}
                query={q}
                isEditing={isEditing}
                onChange={(t) => handleQueryChange(q.id, t)}
              />
            ))}
          </div>

          {/* Section 6(3) clause note */}
          {output.hasSec6_3Clause && (
            <div className="rounded-xl bg-indigo-50/80 border border-indigo-100 p-3.5">
              <p className="text-xs text-indigo-800 font-medium leading-relaxed">
                📌 This application includes the statutory <strong>Section 6(3) transfer clause</strong>{' '}
                mandating the PIO to transfer this application within 5 days if held by another department.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── PIO Authority ───────────────────────────────────────────────── */}
      {hasAuthority && (
        <div className="card p-5 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 mb-1">
            <Landmark className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Addressed To
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {output.publicAuthority.designation}
                  </p>
                  <p className="text-xs text-slate-500">{output.publicAuthority.name}</p>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-slate-600 leading-relaxed break-words">
                  {output.publicAuthority.officeAddress}
                </p>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
            {output.publicAuthority.onlineSupported ? (
              <span className="badge-success">
                <Globe className="w-3.5 h-3.5" />
                Online filing available
              </span>
            ) : (
              <span className="badge-warning">
                <Mail className="w-3.5 h-3.5" />
                Physical post required (Speed Post / Registered Post AD)
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Action Buttons ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-8">
        <button
          type="button"
          onClick={onEdit}
          className="btn-secondary flex-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Edit Input
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="btn-primary flex-1"
          disabled={isEditing}
        >
          {isEditing ? 'Finish editing first' : 'Confirm & Generate PDF'}
          {!isEditing && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
