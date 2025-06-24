// app/api/chat-completion-proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';

// Helper to convert Node.js ReadableStream to Web ReadableStream if needed,
// though fetch response.body is already a Web ReadableStream.
// For this case, we'll directly use the response.body from the upstream fetch.

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();

    const apiKey = process.env.COLOMBO_API_KEY;
    const apiBaseUrl = process.env.COLOMBO_API_URL;

    if (!apiKey) {
      console.error('COLOMBO_API_KEY is not set in environment variables.');
      return NextResponse.json(
        { error: 'Chat API key not configured on server.' },
        { status: 500 }
      );
    }

    if (!apiBaseUrl) {
      console.error('CHAT_COMPLETION_BASE_URL is not set in environment variables.');
      return NextResponse.json(
        { error: 'Chat API URL not configured on server.' },
        { status: 500 }
      );
    }

    const targetUrl = `${apiBaseUrl.replace(/\/$/, '')}/chat/completions`;

    // Ensure stream is always true for this proxy, or respect client's value
    const payloadToColomboAI = {
      ...requestBody,
      stream: true, // Force stream true as this proxy is designed for it
    };

    const colomboAIResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // Or 'text/event-stream' if ColomboAI requires for streams
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payloadToColomboAI),
      // Important for Next.js edge runtime or Vercel: specify duplex for streaming request body if applicable
      // For Node.js runtime, this is usually not needed for `fetch`
      // duplex: 'half' // Only if using Edge runtime and it's required by the platform for streaming req body
    });

    if (!colomboAIResponse.ok) {
      const errorText = await colomboAIResponse.text();
      console.error(`ColomboAI Chat Completions API Error (Status: ${colomboAIResponse.status}): ${errorText}`);
      // Try to parse as JSON, it might contain structured error details
      let errorJson = {};
      try {
        errorJson = JSON.parse(errorText);
      } catch (e) {
        // Not a JSON error, use raw text
      }
      return NextResponse.json(
        {
          error: (errorJson as any).error?.message || (errorJson as any).detail || errorText || 'Failed to get chat completion from upstream API.',
        },
        { status: colomboAIResponse.status }
      );
    }

    // Check if the response body is null, which it shouldn't be for a stream
    if (!colomboAIResponse.body) {
        console.error('ColomboAI Chat Completions API response body is null.');
        return NextResponse.json({ error: 'Upstream API returned no response body for stream.' }, { status: 500 });
    }

    // Return the stream directly from ColomboAI to the client
    // The 'Content-Type' header from ColomboAI (e.g., 'text/event-stream') should ideally be passed along.
    // NextResponse doesn't directly allow setting arbitrary ReadableStream with headers easily in older Next versions.
    // In Next.js 13.4+ (App Router), returning a Response object with a stream is standard.

    const responseHeaders = {
        'Content-Type': colomboAIResponse.headers.get('Content-Type') || 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    };

    // Create a new ReadableStream that pulls from the upstream response body
    const stream = new ReadableStream({
      async start(controller) {
        if (!colomboAIResponse.body) {
          controller.close();
          return;
        }
        const reader = colomboAIResponse.body.getReader();
        function push() {
          reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            controller.enqueue(value);
            push();
          }).catch(err => {
            console.error('Error reading from upstream stream:', err);
            controller.error(err);
          });
        }
        push();
      }
    });

    return new Response(stream, {
      status: 200,
      headers: responseHeaders,
    });

  } catch (error: any) {
    console.error('Error in chat completion proxy API route:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred in chat completion proxy.' },
      { status: 500 }
    );
  }
}
