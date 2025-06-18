// app/api/image-proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const apiKey = process.env.COLOMBO_API_KEY;
    const apiBaseUrl = process.env.COLOMBO_API_URL || 'https://mc1.colomboai.com/v1';
    // Default model can also be from env, overriding client if necessary, or just use what client sends.
    // For this proxy, we'll primarily use what the client sends in 'body.model',
    // but COLOMBO_DEFAULT_MODEL could be a fallback if body.model is not set.
    // However, the client-side already prepares this, so we might not need COLOMBO_DEFAULT_MODEL here.

    if (!apiKey) {
      console.error('COLOMBO_API_KEY is not set in environment variables.');
      return NextResponse.json(
        { error: 'API key not configured on server.' },
        { status: 500 }
      );
    }

    const targetUrl = `${apiBaseUrl.replace(/\/$/, '')}/images/generations`;

    const colomboAIResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body), // Forward the client's request body
    });

    const responseData = await colomboAIResponse.json();

    if (!colomboAIResponse.ok) {
      console.error('ColomboAI API Error:', responseData);
      return NextResponse.json(
        { error: responseData.detail || 'Failed to generate image from upstream API.' },
        { status: colomboAIResponse.status }
      );
    }

    return NextResponse.json(responseData, { status: colomboAIResponse.status });
  } catch (error: any) {
    console.error('Error in image proxy API route:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
