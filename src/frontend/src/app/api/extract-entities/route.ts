/**
 * app/api/extract-entities/route.ts
 * Owner: Anirudhan C (Backend & AI Engineer)
 *
 * This route stub is created by Deepan so the file path matches the architecture.
 * Anirudhan: Replace this stub with Gemini 1.5 Flash dual-pass extraction + linter call.
 *
 * Expected request:  POST application/json { text: string }
 * Expected response: { entities: ExtractedEntities, lintedQueries: LintedRtiQuery[] }
 */
import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_req: NextRequest) {
  // TODO (Anirudhan): Implement Gemini 1.5 Flash extraction here.
  // TODO (Bibin):     Call linter.ts validateAndLintRti() before returning.
  // Reference: ARCHITECTURE_DEEP_DIVE.md §3.2, §3.3
  return NextResponse.json(
    { error: 'Entity extraction API not yet implemented. Use mockApi.ts during development.' },
    { status: 501 }
  );
}
