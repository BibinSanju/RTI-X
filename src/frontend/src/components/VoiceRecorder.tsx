'use client';

/**
 * VoiceRecorder.tsx
 * Deepan Kumar E S — Neural Ninjas (TEAM-008)
 *
 * Records Tamil/English audio using the native browser MediaRecorder API.
 * No third-party audio libraries — native only, as per architecture spec.
 *
 * Props:
 *   onTranscriptionComplete(text) — called with the transcribed text
 *   onError(message)             — called on any error
 *   disabled                     — disables the recorder
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type RecorderState =
  | 'idle'
  | 'requesting-permission'
  | 'recording'
  | 'processing'
  | 'done'
  | 'error';

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  /** Kept for backwards compatibility; now always uses real /api/transcribe */
  useRealApi?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

async function transcribeWithRealApi(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('audio', blob, 'recording.webm');
  const res = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      typeof data.error === 'string'
        ? data.error
        : 'Unable to transcribe your recording. Please try again.'
    );
  }
  return data.text as string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function VoiceRecorder({
  onTranscriptionComplete,
  onError,
  disabled = false,
}: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>('idle');
  const [duration, setDuration] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current)
        streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startTimer = () => {
    setDuration(0);
    timerRef.current = setInterval(
      () => setDuration((d) => d + 1),
      1000
    );
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleError = useCallback(
    (msg: string) => {
      setErrorMsg(msg);
      setState('error');
      onError?.(msg);
      stopTimer();
    },
    [onError]
  );

  const startRecording = async () => {
    if (disabled) return;
    setErrorMsg('');

    setState('requesting-permission');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Pick best supported MIME
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/ogg';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        if (chunksRef.current.length === 0) {
          handleError('No recording detected. Please try again.');
          return;
        }

        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (blob.size === 0) {
          handleError('No recording detected. Please try again.');
          return;
        }

        setState('processing');

        try {
          const text = await transcribeWithRealApi(blob);
          setState('done');
          onTranscriptionComplete(text);
        } catch (err) {
          handleError(
            err instanceof Error && err.message
              ? err.message
              : 'Unable to transcribe your recording. Please try again.'
          );
        }
      };

      recorder.start(250); // collect in 250ms chunks
      setState('recording');
      startTimer();
    } catch (err) {
      if (
        err instanceof DOMException &&
        (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')
      ) {
        handleError('Microphone access is required to record your request.');
      } else {
        handleError('Microphone access is required to record your request.');
      }
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.stop();
      stopTimer();
    }
  };

  const reset = () => {
    setErrorMsg('');
    setDuration(0);
    setState('idle');
  };

  // ---------------------------------------------------------------------------
  // Render states
  // ---------------------------------------------------------------------------

  const isRecording = state === 'recording';
  const isProcessing = state === 'processing';
  const isPermission = state === 'requesting-permission';
  const isDone = state === 'done';
  const isError = state === 'error';

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Main Recording Button */}
      <div className="relative flex items-center justify-center">
        {/* Pulse ring — only shown while recording */}
        {isRecording && (
          <>
            <span className="absolute inline-flex h-24 w-24 rounded-full bg-red-400 opacity-30 animate-ping" />
            <span className="absolute inline-flex h-20 w-20 rounded-full bg-red-400 opacity-20 animate-ping [animation-delay:0.3s]" />
          </>
        )}

        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled || isProcessing || isPermission}
          aria-label={isRecording ? 'Stop recording' : 'Start voice recording'}
          className={[
            'relative z-10 flex items-center justify-center',
            'w-20 h-20 rounded-full',
            'text-white shadow-lg',
            'transition-all duration-200 ease-in-out',
            'focus:outline-none focus:ring-4 focus:ring-offset-2',
            isRecording
              ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300 scale-105'
              : isProcessing || isPermission
              ? 'bg-slate-400 cursor-not-allowed'
              : isDone
              ? 'bg-green-500 hover:bg-green-600 focus:ring-green-300'
              : isError
              ? 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-300'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300 hover:scale-105 active:scale-95',
          ].join(' ')}
        >
          {isProcessing ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : isPermission ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : isDone ? (
            <CheckCircle2 className="w-8 h-8" />
          ) : isError ? (
            <MicOff className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </button>
      </div>

      {/* Status label */}
      <div className="text-center min-h-[3rem] flex flex-col items-center justify-center gap-1">
        {isPermission && (
          <p className="text-sm text-slate-500 animate-pulse">
            Requesting microphone access…
          </p>
        )}

        {isRecording && (
          <>
            <p className="text-sm font-semibold text-red-600 flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              Recording...
            </p>
            <p className="text-2xl font-mono font-bold text-slate-800 tabular-nums">
              {formatDuration(duration)}
            </p>
            <button
              type="button"
              onClick={stopRecording}
              className="mt-1 px-4 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-full hover:bg-red-700 transition-colors shadow-sm"
            >
              Stop
            </button>
          </>
        )}

        {isProcessing && (
          <p className="text-sm font-medium text-indigo-600 animate-pulse">
            Transcribing your recording...
          </p>
        )}

        {isDone && (
          <p className="text-sm font-medium text-emerald-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Voice recorded and transcribed
          </p>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </p>
            <button
              type="button"
              onClick={reset}
              className="text-xs text-indigo-600 font-medium underline underline-offset-2 hover:text-indigo-800"
            >
              Try again
            </button>
          </div>
        )}

        {state === 'idle' && (
          <p className="text-sm text-slate-500 font-medium">
            Tap to start recording
          </p>
        )}
      </div>


    </div>
  );
}
