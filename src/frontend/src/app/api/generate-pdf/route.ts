/**
 * app/api/generate-pdf/route.ts
 * Owner: Bibin Sanju S (Team Lead / Tech Lead)
 *
 * This route stub is created by Deepan so the file path matches the architecture.
 * Bibin: Replace this stub with the @react-pdf/renderer implementation.
 *
 * Expected request:  POST application/json { ...VerifiedRtiOutput }
 * Expected response: application/pdf (binary)
 */
import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_req: NextRequest) {
  // TODO (Bibin): Implement @react-pdf/renderer PDF generation here.
  // Reference: ARCHITECTURE_DEEP_DIVE.md §3.6
  return NextResponse.json(
    { error: 'PDF generation API not yet implemented.' },
    { status: 501 }
  );
}
