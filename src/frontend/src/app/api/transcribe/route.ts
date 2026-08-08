import { NextRequest, NextResponse } from 'next/server';
import Groq, { toFile } from 'groq-sdk';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY environment variable is missing.' },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const audioFile = formData.get('audio');

    if (!audioFile || !(audioFile instanceof Blob) || audioFile.size === 0) {
      return NextResponse.json(
        { error: 'No recording detected. Please try again.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const file = await toFile(buffer, 'audio.webm', {
      type: audioFile.type || 'audio/webm',
    });

    const groq = new Groq({ apiKey });

    const transcription = await groq.audio.transcriptions.create({
      file,
      model: 'whisper-large-v3',
    });

    return NextResponse.json({ text: transcription.text });
  } catch (err) {
    console.error('Groq transcription error:', err);
    return NextResponse.json(
      { error: 'Unable to transcribe your recording. Please try again.' },
      { status: 500 }
    );
  }
}

