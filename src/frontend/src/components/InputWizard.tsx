'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/**
 * InputWizard.tsx
 * RTI-GPT — Two-Page Citizen Workflow
 *
 * Page 1: Citizen Details (Name, Email, Phone, Address, Optional Ward)
 * Page 2: Voice Problem Input (MediaRecorder + Groq Whisper STT + Editable Transcription)
 */

import React, { useState, useCallback } from 'react';
import {
  FileText,
  Download,
  RotateCcw,
  CheckCircle2,
  Loader2,
  Mic,
  Brain,
  Search,
  Building2,
  ArrowLeft,
  ArrowRight,
  Edit3,
} from 'lucide-react';

import VoiceRecorder from '@/components/VoiceRecorder';
import RtiPreview from '@/components/RtiPreview';
import EmergencyBanner from '@/components/EmergencyBanner';
import { fetchEmergencyContacts } from '@/lib/emergencyContacts';
import {
  mockExtractAndLint,
  mockResolvePio,
  assembleMockOutput,
} from '@/lib/mockApi';
import type {
  WizardStep,
  ProcessingStep,
  ProcessingStepStatus,
  ExtractedEntities,
  LintedRtiQuery,
  VerifiedRtiOutput,
} from '@/types/rti';

const USE_REAL_API = process.env.NEXT_PUBLIC_USE_REAL_API === 'true';

const INITIAL_STEPS: ProcessingStep[] = [
  {
    id: 'transcribing',
    label: 'Transcribing voice',
    labelTa: 'குரலை எழுத்தாக மாற்றுகிறோம்',
    status: 'waiting',
  },
  {
    id: 'understanding',
    label: 'Understanding your complaint',
    labelTa: 'உங்கள் பிரச்சனையை புரிந்துகொள்கிறோம்',
    status: 'waiting',
  },
  {
    id: 'resolving',
    label: 'Finding the right authority',
    labelTa: 'சரியான அதிகாரியை கண்டுபிடிக்கிறோம்',
    status: 'waiting',
  },
];

/** Progress indicator for Page 1 vs Page 2 */
function CitizenProgressBar({ currentStep }: { currentStep: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-4 w-full max-w-sm mx-auto" role="progressbar" aria-label="Application progress">
      {/* Step 1 */}
      <div className="flex items-center gap-2">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
            currentStep === 1
              ? 'bg-indigo-600 text-white'
              : 'bg-emerald-600 text-white'
          }`}
        >
          {currentStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
        </div>
        <span
          className={`text-xs font-semibold ${
            currentStep === 1 ? 'text-indigo-600' : 'text-slate-700'
          }`}
        >
          1. Your Details
        </span>
      </div>

      {/* Bar */}
      <div
        className={`h-0.5 w-12 rounded transition-all duration-300 ${
          currentStep > 1 ? 'bg-emerald-500' : 'bg-slate-200'
        }`}
      />

      {/* Step 2 */}
      <div className="flex items-center gap-2">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
            currentStep === 2
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-400 border border-slate-300'
          }`}
        >
          2
        </div>
        <span
          className={`text-xs font-semibold ${
            currentStep === 2 ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          2. Your Problem
        </span>
      </div>
    </div>
  );
}

function ProcessingStepRow({ step }: { step: ProcessingStep }) {
  const icons: Record<ProcessingStep['id'], React.ReactNode> = {
    recording: <Mic className="w-4 h-4" />,
    transcribing: <FileText className="w-4 h-4" />,
    understanding: <Brain className="w-4 h-4" />,
    resolving: <Search className="w-4 h-4" />,
  };

  const statusColor: Record<ProcessingStepStatus, string> = {
    waiting: 'text-slate-400 bg-slate-100',
    active: 'text-indigo-600 bg-indigo-100',
    done: 'text-green-600 bg-green-100',
    error: 'text-red-600 bg-red-100',
  };

  return (
    <div
      className={[
        'flex items-center gap-3 p-3 rounded-xl transition-all duration-300',
        step.status === 'active' ? 'bg-indigo-50 border border-indigo-200' : 'bg-white border border-slate-100',
      ].join(' ')}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${statusColor[step.status]}`}>
        {step.status === 'active' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : step.status === 'done' ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          icons[step.id]
        )}
      </div>
      <div>
        <p className={`text-sm font-semibold ${step.status === 'waiting' ? 'text-slate-400' : 'text-slate-800'}`}>
          {step.label}
        </p>
        <p className="text-xs text-slate-400 font-tamil">{step.labelTa}</p>
      </div>
    </div>
  );
}

export default function InputWizard() {
  // Page 1 vs Page 2 state (for input phase)
  const [activePage, setActivePage] = useState<1 | 2>(1);
  const [step, setStep] = useState<WizardStep | 'helpline'>('input');

  // Page 1 Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [ward, setWard] = useState(''); // OPTIONAL

  // Page 1 Validation Errors
  const [formErrors, setFormErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
  }>({});

  // Page 2 Voice / Text Input State
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [transcribedText, setTranscribedText] = useState('');
  const [editedTranscription, setEditedTranscription] = useState('');

  const [hasAddressedIssue, setHasCalledHelpline] = useState(false);
  const [manualText, setManualText] = useState('');

  // Processing state
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>(INITIAL_STEPS);
  const [processingError, setProcessingError] = useState('');

  // Review & Final Output
  const [rtiOutput, setRtiOutput] = useState<VerifiedRtiOutput | null>(null);
  const [confirmedOutput, setConfirmedOutput] = useState<VerifiedRtiOutput | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [helplineData, setHelplineData] = useState<any>(null);
  const [complaintId, setComplaintId] = useState<string | null>(null);

  const updateStepStatus = useCallback(
    (id: ProcessingStep['id'], status: ProcessingStepStatus) => {
      setProcessingSteps((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      );
    },
    []
  );

  // Validate Page 1 before moving to Page 2
  const handlePage1Continue = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const errors: { fullName?: string; email?: string; phone?: string; address?: string } = {};

    if (!fullName.trim()) {
      errors.fullName = 'Full Name is required';
    }
    if (!email.trim()) {
      errors.email = 'Email ID is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    if (!phone.trim()) {
      errors.phone = 'Phone Number is required';
    } else if (phone.trim().replace(/\D/g, '').length < 10) {
      errors.phone = 'Please enter a valid phone number (at least 10 digits)';
    }
    if (!address.trim()) {
      errors.address = 'Address is required';
    }
    // NOTE: Ward is strictly OPTIONAL. No error if empty.

    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      setActivePage(2);
    }
  };

  // Determine effective problem text
  const finalProblemText =
    inputMode === 'voice'
      ? editedTranscription.trim() || transcribedText.trim()
      : manualText.trim();

  // Downstream RTI Processing Pipeline
  const runProcessing = async () => {
    if (!finalProblemText) return;
    setStep('processing');
    setProcessingSteps(INITIAL_STEPS.map((s) => ({ ...s, status: 'waiting' })));
    setProcessingError('');

    try {
      // Phase 1: Transcription visual confirmation
      updateStepStatus('transcribing', 'active');
      await new Promise((r) => setTimeout(r, 400));
      updateStepStatus('transcribing', 'done');

      // Phase 2: Understanding (Classify Intent)
      updateStepStatus('understanding', 'active');
      
      let classification = { classification: "IMMEDIATE_CAUSE", department: "ROAD_INFRASTRUCTURE", ward: ward };
      
      if (USE_REAL_API) {
        const classifyRes = await fetch('/api/classify-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grievance_text: finalProblemText }),
        });
        if (!classifyRes.ok) throw new Error(`Classification failed`);
        classification = await classifyRes.json();
      }
      
      updateStepStatus('understanding', 'done');
      updateStepStatus('resolving', 'active');
      
      // Dummy user ID for testing since auth is not integrated
      const DUMMY_USER_ID = "00000000-0000-0000-0000-000000000000";

      if (classification.classification === "IMMEDIATE_CAUSE") {
          let hData: any = { 
              category: classification.department
          };
          try {
            const ward_name = ward || classification.ward;
            const contactsRes = await fetchEmergencyContacts(classification.department, "HIGH", ward_name);
            hData.contactsData = contactsRes;
          } catch (e) {
            console.error(e);
            hData.contactsData = null;
          }
          if (USE_REAL_API) {
            const resolveRes = await fetch('/api/helpline/resolve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    district: "Coimbatore",
                    ward: ward || classification.ward,
                    department: classification.department
                }),
            });
            if (resolveRes.ok) hData = await resolveRes.json();
          }
          
          if (USE_REAL_API) {
            const createRes = await fetch('/api/complaints/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: DUMMY_USER_ID,
                    district: "Coimbatore",
                    ward_name: ward || classification.ward,
                    department_category: classification.department,
                    rejection_risk_score: "LOW"
                }),
            });
            if (createRes.ok) {
              const complaint = await createRes.json();
              setComplaintId(complaint.id);
            }
          }
          
          setHelplineData(hData);
          updateStepStatus('resolving', 'done');
          setStep('helpline');
      } else {
          // DIRECT_RTI
          let cId = "mock-complaint";
          if (USE_REAL_API) {
            const createRes = await fetch('/api/complaints/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: DUMMY_USER_ID,
                    district: "Coimbatore",
                    ward_name: ward || classification.ward,
                    department_category: classification.department,
                    rejection_risk_score: "LOW"
                }),
            });
            if (createRes.ok) {
              const complaint = await createRes.json();
              cId = complaint.id;
              setComplaintId(complaint.id);
            }
          }
          
          let draftText = "Under Section 2(f) of the RTI Act...";
          let pioDesig = "Public Information Officer";
          let pioAddress = "Municipal Corporation";
          
          if (USE_REAL_API) {
            const rtiRes = await fetch('/api/rti/draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    complaint_id: cId,
                    user_description: finalProblemText
                })
            });
            if (rtiRes.ok) {
              const rtiDraft = await rtiRes.json();
              draftText = rtiDraft.rti_text;
              pioDesig = rtiDraft.target_pio_designation;
              pioAddress = rtiDraft.target_pio_address;
            }
          }
          
          updateStepStatus('resolving', 'done');
          
          // Construct the mock output structure since the rest of the UI expects it
          const output: VerifiedRtiOutput = {
              applicant: { name: fullName, phone, address, pincode: "641012" },
              publicAuthority: {
                  designation: pioDesig,
                  officeAddress: pioAddress,
                  name: classification.department,
                  district: "Coimbatore",
                  pincode: "641012"
              },
              lintedQueries: [{ originalText: "", lintedText: draftText, type: "Data" }],
              extractedEntities: { 
                  intent: "DIRECT_RTI", 
                  category: classification.department, 
                  locationDetails: ward, 
                  timeframe: "", 
                  urgency: "LOW" 
              }
          };
          setRtiOutput(output);
          setStep('review');
      }
    } catch (err) {
      setProcessingError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
      setProcessingSteps((prev) =>
        prev.map((s) => (s.status === 'active' ? { ...s, status: 'error' } : s))
      );
    }
  };

  const handleDownloadPdf = async () => {
    if (!confirmedOutput) return;
    setIsPdfLoading(true);
    try {
      if (USE_REAL_API) {
        const res = await fetch('/api/generate-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(confirmedOutput),
        });
        if (!res.ok) throw new Error(`PDF generation failed: ${res.status}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeName = (confirmedOutput.applicant.name || 'Citizen').replace(/\s+/g, '_');
        a.download = `${safeName}_RTI_${confirmedOutput.publicAuthority.district}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        await new Promise((r) => setTimeout(r, 800));
        window.print();
      }
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleReset = () => {
    setActivePage(1);
    setStep('input');
    setTranscribedText('');
    setEditedTranscription('');
    setManualText('');
    setFullName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setWard('');
    setFormErrors({});
    setRtiOutput(null);
    setConfirmedOutput(null);
    setProcessingError('');
    setInputMode('voice');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* ── Public Service Header ──────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
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

      {/* ── Step Progress Indicator (Only shown during Input stage) ───── */}
      {step === 'input' && (
        <div className="bg-white border-b border-slate-200 py-3 px-4">
          <CitizenProgressBar currentStep={activePage} />
        </div>
      )}

      {/* ── Main Content Container ─────────────────────────────────────── */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 sm:py-10">

        {/* ═══════════════════════════════════════════════════════════════
            PAGE 1 — USER DETAILS
           ═══════════════════════════════════════════════════════════════ */}
        {step === 'input' && activePage === 1 && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">Your Details</h2>
              <p className="text-sm text-slate-500 mt-1">
                Tell us a little about yourself before we prepare your RTI request.
              </p>
            </div>

            <form onSubmit={handlePage1Continue} className="space-y-5" noValidate>
              {/* Desktop 2-column grid for Name, Email, Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {/* Full Name */}
                <div className="md:col-span-2">
                  <label htmlFor="applicant-name" className="text-sm font-medium text-slate-700 block mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="applicant-name"
                    type="text"
                    className={`w-full px-3.5 py-2.5 bg-white border ${
                      formErrors.fullName ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-300'
                    } rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (formErrors.fullName) setFormErrors((prev) => ({ ...prev, fullName: undefined }));
                    }}
                    autoComplete="name"
                  />
                  {formErrors.fullName && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{formErrors.fullName}</p>
                  )}
                </div>

                {/* Email ID */}
                <div>
                  <label htmlFor="applicant-email" className="text-sm font-medium text-slate-700 block mb-1">
                    Email ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="applicant-email"
                    type="email"
                    className={`w-full px-3.5 py-2.5 bg-white border ${
                      formErrors.email ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-300'
                    } rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    autoComplete="email"
                  />
                  {formErrors.email && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{formErrors.email}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="applicant-phone" className="text-sm font-medium text-slate-700 block mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="applicant-phone"
                    type="tel"
                    className={`w-full px-3.5 py-2.5 bg-white border ${
                      formErrors.phone ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-300'
                    } rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    autoComplete="tel"
                  />
                  {formErrors.phone && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{formErrors.phone}</p>
                  )}
                </div>

                {/* Address (Multiline) */}
                <div className="md:col-span-2">
                  <label htmlFor="applicant-address" className="text-sm font-medium text-slate-700 block mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="applicant-address"
                    rows={3}
                    className={`w-full px-3.5 py-2.5 bg-white border ${
                      formErrors.address ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-300'
                    } rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 leading-relaxed`}
                    placeholder="Door No, Street, Area, City, District, State, Pincode"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (formErrors.address) setFormErrors((prev) => ({ ...prev, address: undefined }));
                    }}
                    autoComplete="street-address"
                  />
                  {formErrors.address ? (
                    <p className="text-xs text-red-600 mt-1 font-medium">{formErrors.address}</p>
                  ) : (
                    <p className="text-xs text-slate-400 mt-1">Include your door number, street, area, city, and pincode.</p>
                  )}
                </div>

                {/* Ward Name / Number (Optional) */}
                <div className="md:col-span-2">
                  <label htmlFor="applicant-ward" className="text-sm font-medium text-slate-700 block mb-1">
                    Ward Name / Number <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="applicant-ward"
                    type="text"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. Ward 42 or Gandhipuram Ward"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    If known, enter your municipal ward number or ward name. You may leave this blank.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            PAGE 2 — VOICE / PROBLEM INPUT
           ═══════════════════════════════════════════════════════════════ */}
        {step === 'input' && activePage === 2 && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
            {/* Top Navigation: Back to Page 1 */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <button
                type="button"
                onClick={() => setActivePage(1)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors py-1 px-2 rounded-md hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Details
              </button>
              <span className="text-xs text-slate-400 font-medium">Page 2 of 2</span>
            </div>

            {/* Header */}
            <div>
              <h2 className="text-xl font-bold text-slate-900">Tell Us Your Problem</h2>
              <p className="text-sm text-slate-500 mt-1">
                Speak naturally in Tamil or English. Your words will be transcribed as spoken.
              </p>
            </div>

            {/* Mode Selector: Voice / Type */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg max-w-xs">
              <button
                type="button"
                onClick={() => setInputMode('voice')}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                  inputMode === 'voice'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🎙 Voice
              </button>
              <button
                type="button"
                onClick={() => setInputMode('text')}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                  inputMode === 'text'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ✎ Type
              </button>
            </div>

            {/* Voice Mode */}
            {inputMode === 'voice' && (
              <div className="space-y-6">
                {/* Voice Recorder Control */}
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center">
                  <VoiceRecorder
                    onTranscriptionComplete={(text) => {
                      setTranscribedText(text);
                      setEditedTranscription(text);
                    }}
                    onError={(msg) => console.error('Voice error:', msg)}
                  />
                </div>

                {/* Post-Transcription Editable Result */}
                {(editedTranscription || transcribedText) && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Edit3 className="w-4 h-4 text-indigo-600" />
                        Your Transcription
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        You can edit the transcription before continuing.
                      </p>
                    </div>

                    <textarea
                      className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 leading-relaxed font-sans"
                      rows={5}
                      value={editedTranscription}
                      onChange={(e) => setEditedTranscription(e.target.value)}
                    />

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTranscribedText('');
                          setEditedTranscription('');
                        }}
                        aria-label="Discard recording and record again"
                        className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Record Again
                      </button>

                      <button
                        type="button"
                        onClick={runProcessing}
                        disabled={!editedTranscription.trim()}
                        className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Type Mode */}
            {inputMode === 'text' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="manual-problem" className="text-sm font-medium text-slate-700 block mb-1">
                    Describe your problem
                  </label>
                  <textarea
                    id="manual-problem"
                    rows={6}
                    className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 leading-relaxed"
                    placeholder="Describe your issue in detail (e.g. location, duration, and damage)..."
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Provide location details and how long the problem has persisted.
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={runProcessing}
                    disabled={!manualText.trim()}
                    className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            PROCESSING STEP
           ═══════════════════════════════════════════════════════════════ */}
        {step === 'processing' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 max-w-md mx-auto shadow-xs space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 mx-auto flex items-center justify-center">
                <Brain className="w-7 h-7 text-indigo-600 animate-pulse" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Preparing your RTI</h2>
              <p className="text-xs text-slate-500">Analysing details and locating target authority...</p>
            </div>

            <div className="space-y-3">
              {processingSteps.map((s) => (
                <ProcessingStepRow key={s.id} step={s} />
              ))}
            </div>

            {processingError && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 space-y-2">
                <p className="text-sm font-semibold text-red-700">Something went wrong</p>
                <p className="text-sm text-red-600">{processingError}</p>
                <button
                  type="button"
                  className="w-full py-2 bg-white border border-red-200 text-xs font-semibold text-red-700 rounded-lg hover:bg-red-50"
                  onClick={() => {
                    setStep('input');
                    setActivePage(2);
                  }}
                >
                  Go back and try again
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            STEP 3 — REVIEW (RtiPreview)
           ═══════════════════════════════════════════════════════════════ */}
        {step === 'review' && rtiOutput && (
          <div className="space-y-6">
            <EmergencyBanner 
              category={rtiOutput.extractedEntities.category} 
              severity={(rtiOutput.extractedEntities.urgency as any) || 'HIGH'} 
              pincode={rtiOutput.applicant.pincode}
            />
            <RtiPreview
              output={rtiOutput}
              onConfirm={(confirmed) => {
                setConfirmedOutput(confirmed);
                setStep('final');
              }}
              onEdit={() => {
                setStep('input');
                setActivePage(2);
              }}
            />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            STEP 4 — FINAL
           ═══════════════════════════════════════════════════════════════ */}
        {step === 'final' && confirmedOutput && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 max-w-lg mx-auto shadow-xs space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Your RTI is ready!</h2>
              <p className="text-xs text-slate-500">
                Your legally compliant RTI application has been prepared.
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Target Public Authority
              </h3>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {confirmedOutput.publicAuthority.designation}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {confirmedOutput.publicAuthority.name}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {confirmedOutput.publicAuthority.officeAddress}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                id="download-pdf-btn"
                className="w-full min-h-[44px] py-3 bg-indigo-600 text-white font-semibold text-sm rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                onClick={handleDownloadPdf}
                disabled={isPdfLoading}
              >
                {isPdfLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating PDF…
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download RTI PDF
                  </>
                )}
              </button>

              <button
                type="button"
                className="w-full py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                onClick={() => setStep('review')}
              >
                Review Application Again
              </button>

              <button
                type="button"
                className="w-full text-xs text-slate-500 hover:text-slate-700 transition-colors py-2 flex items-center justify-center gap-1.5"
                onClick={handleReset}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Start a new RTI
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            STEP: HELPLINE (Immediate Cause)
           ═══════════════════════════════════════════════════════════════ */}
        {step === 'helpline' && helplineData && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 max-w-lg mx-auto shadow-xs space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 mx-auto flex items-center justify-center">
                <Search className="w-7 h-7 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Let's Try Solving This First!</h2>
              <p className="text-xs text-slate-500">
                This issue looks like an immediate problem that can be resolved locally without filing a formal RTI.
              </p>
            </div>

            {helplineData.contactsData && helplineData.contactsData.contacts && helplineData.contactsData.contacts.length > 0 ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
                <h3 className="text-lg font-medium text-red-800 mb-2">Please call the number below to report:</h3>
                <ul className="space-y-3">
                  {helplineData.contactsData.contacts.map((contact: any) => (
                    <li key={contact.id} className="bg-white p-3 rounded border border-red-200 shadow-sm">
                      <span className="font-semibold text-gray-900">{contact.title}: </span>
                      <a href={`tel:${contact.value.replace(/\s+/g, '')}`} className="text-blue-700 hover:underline font-bold text-lg">
                        {contact.value}
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 bg-white p-3 rounded border border-gray-300">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      checked={hasAddressedIssue} 
                      onChange={(e) => setHasCalledHelpline(e.target.checked)} 
                    />
                    <span className="text-sm font-medium text-slate-800">I have addressed the issue / called the number</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 font-medium">
                No emergency contacts found in the database for this category ({helplineData.category}). Please populate the DB.
              </div>
            )}

            <div className="space-y-3 mt-6">
              <button
                type="button"
                disabled={helplineData.contactsData && helplineData.contactsData.contacts?.length > 0 ? !hasAddressedIssue : false}
                className={`w-full min-h-[44px] py-3 text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center shadow-xs ${
                  (helplineData.contactsData && helplineData.contactsData.contacts?.length > 0 && !hasAddressedIssue) 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
                onClick={async () => {
                    if (USE_REAL_API && complaintId) {
                      await fetch(`/api/complaints/update-status/${complaintId}`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: "LOCAL_DEADLINE_EXPIRED" })
                      });
                    }
                    handleReset();
                    alert("Ticket Registered! Timeline of 48 hours has been activated.");
                }}
              >
                Register Ticket
              </button>
              
              <button
                type="button"
                className="w-full py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                onClick={() => handleReset()}
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="text-center py-4 px-4 text-xs text-slate-400 border-t border-slate-200 bg-white">
        <p>Built for Right to Information (RTI) Citizen Support · UN SDG 16</p>
      </footer>
    </div>
  );
}

