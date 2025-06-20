// app/api/video-proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const apiKey = process.env.COLOMBO_API_KEY;
    const apiBaseUrl = process.env.COLOMBO_API_URL;

    if (!apiKey) {
      console.error('COLOMBO_API_KEY is not set in environment variables.');
      return NextResponse.json({ error: 'Video API key not configured on server.' }, { status: 500 });
    }
    if (!apiBaseUrl) {
      console.error('COLOMBO_API_URL is not set in environment variables.');
      return NextResponse.json({ error: 'Video API URL not configured on server.' }, { status: 500 });
    }

    const targetUrl = `${apiBaseUrl.replace(/\/$/, '')}/videos/generations`;

    const colomboAIResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const responseText = await colomboAIResponse.text();
    let responseData;

    // console.log('Received raw response text from Colombo AI:', responseText);
    // console.log('Colombo AI Response Status:', colomboAIResponse.status);

    if (!colomboAIResponse.ok) {
      console.error(`ColomboAI Video API Error (Status: ${colomboAIResponse.status}): ${responseText}`);
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        return NextResponse.json(
          { error: `Failed to generate video. Upstream API returned non-JSON error: ${responseText.substring(0, 500)}` },
          { status: colomboAIResponse.status }
        );
      }
      return NextResponse.json(
        {
          error: responseData.error || responseData.detail || 'Failed to generate video from upstream API.',
          status_code: responseData.status_code || responseData.status || colomboAIResponse.status,
          raw_error: responseText.substring(0, 500)
        },
        { status: colomboAIResponse.status }
      );
    }

    // If response.ok is true, handle potential stream-like "data: {...}" responses
    if (responseText.includes("data: ")) {
      // console.log("Detected 'data: ' prefix, attempting to parse as stream-like response.");
      const parts = responseText.trim().split(/data: /g).filter(part => part.trim() !== "");
      if (parts.length > 0) {
        const lastPart = parts[parts.length - 1];
        // console.log("Last part of stream-like response:", lastPart);
        try {
          responseData = JSON.parse(lastPart);
        } catch (e) {
          console.error(`Failed to parse last JSON object from stream-like response (Status: ${colomboAIResponse.status}): ${lastPart.substring(0,500)}`, e);
          return NextResponse.json(
            { error: `Upstream API (OK status) returned stream-like data, but failed to parse final JSON object: ${lastPart.substring(0,500)}` },
            { status: 502 } // Bad Gateway, as upstream sent something unexpected or malformed in the stream
          );
        }
      } else {
        console.error(`Upstream API (OK status) sent 'data: ' prefixes but no parsable parts: ${responseText.substring(0,500)}`);
        return NextResponse.json(
          { error: `Upstream API (OK status) sent 'data: ' prefixes but no parsable JSON objects found: ${responseText.substring(0,500)}` },
          { status: 502 }
        );
      }
    } else {
      // If not stream-like, parse as a single JSON object
      // console.log("No 'data: ' prefix detected, attempting to parse as single JSON object.");
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error(`ColomboAI Video API (Status: ${colomboAIResponse.status}) returned OK but non-JSON response: ${responseText.substring(0,500)}`, e);
        return NextResponse.json(
          { error: `Upstream API returned OK but with invalid JSON response: ${responseText.substring(0,500)}` },
          { status: 502 }
        );
      }
    }

    // console.log('Successfully parsed response from Colombo AI:', responseData);
    return NextResponse.json(responseData, { status: colomboAIResponse.status });

  } catch (error: any) {
    console.error('Error in video proxy API route:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred in video proxy.' },
      { status: 500 }
    );
  }
}
