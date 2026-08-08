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
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 animate-fade-in-up">
      {/* Query number + compliance badge */}
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center mt-0.5">
          {query.id}
        </span>
        <div className="flex-1 min-w-0">
          {/* If linter modified: show original struck-through */}
          {query.wasModifiedByLinter && (
            <div className="mb-2">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Original (AI-corrected)
              </p>
              <p className="text-sm text-slate-400 line-through leading-relaxed">
                {query.originalQuery}
              </p>
            </div>
          )}

          {/* Linted query — editable when isEditing */}
          <div>
            {query.wasModifiedByLinter && (
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                RTI-GPT Request
              </p>
            )}
            {isEditing ? (
              <textarea
                className="input-field text-sm leading-relaxed resize-none min-h-[80px]"
                value={query.lintedQuery}
                onChange={(e) => onChange(e.target.value)}
                rows={3}
              />
            ) : (
              <p className="text-sm text-slate-800 leading-relaxed">
                {query.lintedQuery}
              </p>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-2">
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
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="text-center space-y-1 px-4">
        <h2 className="text-xl font-bold text-slate-800">
          Review Your RTI Application
        </h2>
        <p className="text-sm text-slate-500">
          RTI-GPT has converted your complaint into a legally valid request.
          <br />
          <span className="text-tamil text-xs text-slate-400">
            உங்கள் புகாரை சட்டப்பூர்வ கோரிக்கையாக மாற்றியுள்ளோம்.
          </span>
        </p>
      </div>

      {/* ── Validation Summary Strip ────────────────────────────────────── */}
      <div className="card p-4 flex flex-wrap gap-2 justify-center">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 lg:px-0">

        {/* LEFT: Original Complaint */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Your Complaint
            </h3>
          </div>

          <div className="complaint-card min-h-[120px]">
            <p className="text-base text-slate-700 leading-relaxed">
              {output.applicant.address && (
                <span className="text-xs text-slate-500 font-medium block mb-2">
                  📍 {output.applicant.address}, {output.publicAuthority?.district}
                </span>
              )}
              {/* rawGrievanceSummary is on ExtractedEntities, not VerifiedRtiOutput;
                  we stash it as the subject for display purposes */}
              {output.subject}
            </p>
          </div>

          {/* Applicant card */}
          <div className="card p-4 space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Applicant Details
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {output.applicant.name || 'Not provided'}
            </p>
            <p className="text-sm text-slate-600">{output.applicant.address}</p>
            <p className="text-sm text-slate-600">Pincode: {output.applicant.pincode}</p>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Court Fee: ₹{output.feeDetails.amount} ({output.feeDetails.mode.replace(/_/g, ' ')})
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: RTI-GPT Legal Queries */}
        <div className="space-y-3">
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
          <div className="linted-card">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
              Subject
            </p>
            {isEditing ? (
              <input
                type="text"
                className="input-field text-sm"
                defaultValue={output.subject}
              />
            ) : (
              <p className="text-sm text-slate-800 font-medium leading-snug">
                {output.subject}
              </p>
            )}
          </div>

          {/* Queries list */}
          <div className="space-y-3">
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
            <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3">
              <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                📌 This application includes the mandatory <strong>Section 6(3) transfer clause</strong>{' '}
                protecting your rights if the authority is incorrect.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── PIO Authority ───────────────────────────────────────────────── */}
      {hasAuthority && (
        <div className="card p-5 mx-4 lg:mx-0 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Landmark className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Addressed To
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <p className="text-xs text-slate-600 leading-relaxed">
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
      <div className="flex flex-col sm:flex-row gap-3 px-4 lg:px-0 pb-8">
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
