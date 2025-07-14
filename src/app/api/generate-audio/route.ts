import { getCustomOpenaiApiKey, getCustomOpenaiApiUrl } from '@/lib/config';

interface AudioGenerationBody {
  prompt: string;
  negative_prompt?: string;
  duration_seconds?: number;
  seed?: number;
  model?: string;
}

export const POST = async (req: Request) => {
  try {
    const body: AudioGenerationBody = await req.json();

    const apiKey = getCustomOpenaiApiKey();
    const apiUrl = getCustomOpenaiApiUrl();

    if (!apiKey || !apiUrl) {
      return Response.json(
        { error: 'Custom OpenAI API key or URL not configured' },
        { status: 400 }
      );
    }

    const requestBody = {
      prompt: body.prompt,
      negative_prompt: body.negative_prompt || '',
      duration_seconds: parseFloat(String(body.duration_seconds || 10)),
      seed: body.seed,
      model: body.model || 'stabilityai/stable-audio-open-1.0',
    };

    const response = await fetch(`${apiUrl}audio/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Audio generation API error:', errorData);
      return Response.json(
        { error: 'Failed to generate audio' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data, { status: 200 });
  } catch (err) {
    console.error('Audio generation error:', err);
    return Response.json(
      { error: 'An error occurred while generating audio' },
      { status: 500 }
    );
  }
};