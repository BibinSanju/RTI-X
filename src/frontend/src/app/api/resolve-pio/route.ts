/**
 * app/api/resolve-pio/route.ts
 * Owner: Dharshini S (Data & Full-Stack)
 *
 * This route stub is created by Deepan so the file path matches the architecture.
 * Dharshini: Replace this stub with the real pioResolver.ts lookup.
 *
 * Expected request:  GET /api/resolve-pio?pincode=641012&category=ROADS_AND_SEWAGE
 * Expected response: VerifiedRtiOutput['publicAuthority'] shape
 */
import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
  // TODO (Dharshini): Implement pioResolver.ts lookup here.
  // Reference: ARCHITECTURE_DEEP_DIVE.md §3.4
  return NextResponse.json(
    { error: 'PIO resolver API not yet implemented. Use mockApi.ts during development.' },
    { status: 501 }
  );
}
