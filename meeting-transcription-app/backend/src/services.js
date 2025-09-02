import OpenAI from 'openai';
import fs from 'fs';

export async function transcribeAudio(filePath) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const fileStream = fs.createReadStream(filePath);

  const transcription = await client.audio.transcriptions.create({
    file: fileStream,
    model: 'whisper-1',
    response_format: 'verbose_json',
    temperature: 0,
  });

  return {
    text: transcription.text,
    language: transcription.language,
    duration: transcription.duration,
    segments: transcription.segments,
  };
}

