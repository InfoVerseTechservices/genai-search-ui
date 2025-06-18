// app/api/audio-proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();

    const apiKey = process.env.COLOMBO_API_KEY;
    // Use a specific audio API URL or default to the general one if not set
    const audioApiBaseUrl = process.env.COLOMBO_AUDIO_API_URL || process.env.COLOMBO_API_URL || 'https://mc1.colomboai.com/v1';

    // Default audio model from environment or fallback
    const defaultAudioModel = process.env.COLOMBO_AUDIO_DEFAULT_MODEL || 'stable-audio-open-1.0';

    if (!apiKey) {
      console.error('COLOMBO_API_KEY is not set in environment variables for audio proxy.');
      return NextResponse.json(
        { error: 'API key not configured on server for audio generation.' },
        { status: 500 }
      );
    }

    const targetUrl = `${audioApiBaseUrl.replace(/\/$/, '')}/audio/generations`;

    // Prepare the body for ColomboAI, ensuring defaults are respected
    const colomboAIBody = {
      prompt: requestBody.prompt,
      negative_prompt: requestBody.negative_prompt || "Low quality.", // Default from user spec
      duration_seconds: requestBody.duration_seconds || 10, // Default from user spec
      seed: requestBody.seed || 0, // Default from user spec
      model: requestBody.model || defaultAudioModel, // Use client model or env default
    };

    const colomboAIResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(colomboAIBody),
    });

    const responseData = await colomboAIResponse.json();

    if (!colomboAIResponse.ok) {
      console.error('ColomboAI Audio API Error:', responseData);
      return NextResponse.json(
        { error: responseData.detail || 'Failed to generate audio from upstream API.' },
        { status: colomboAIResponse.status }
      );
    }

    // Important: The example response showed an "image.generation" object.
    // If the actual audio API returns a different structure (e.g., object: "audio.generation"),
    // this proxy doesn't need to care, it just forwards the JSON.
    // The client-side will need to handle the actual structure.
    return NextResponse.json(responseData, { status: colomboAIResponse.status });

  } catch (error: any) {
    console.error('Error in audio proxy API route:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred in audio proxy.' },
      { status: 500 }
    );
  }
}
