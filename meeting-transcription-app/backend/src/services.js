import OpenAI from 'openai';
import fs from 'fs';

export async function transcribeAudio(filePath) {
  if (!process.env.OPENAI_API_KEY) {
    const stats = fs.statSync(filePath);
    const fakeDurationSec = Math.max(3, Math.min(3600, Math.round(stats.size / 32000)));
    return {
      text: 'MOCK: Transcription indisponible sans OPENAI_API_KEY. Ceci est un texte simulé pour vos tests end-to-end.',
      language: 'fr',
      duration: fakeDurationSec,
      segments: [
        {
          id: 0,
          start: 0,
          end: Math.min(5, fakeDurationSec),
          text: 'MOCK: Début de la réunion et introduction des participants.',
        },
        {
          id: 1,
          start: Math.min(5, fakeDurationSec),
          end: fakeDurationSec,
          text: 'MOCK: Discussion principale, décisions et prochaines actions.',
        },
      ],
    };
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

