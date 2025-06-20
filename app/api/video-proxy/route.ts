// app/api/video-proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const apiKey = process.env.COLOMBO_API_KEY;
    const apiBaseUrl = process.env.COLOMBO_API_URL;

    if (!apiKey) {
      console.error('COLOMBO_API_KEY is not set in environment variables.');
      return NextResponse.json(
        { error: 'Video API key not configured on server.' },
        { status: 500 }
      );
    }

    if (!apiBaseUrl) {
      console.error('COLOMBO_API_URL is not set in environment variables.');
      return NextResponse.json(
        { error: 'Video API URL not configured on server.' },
        { status: 500 }
      );
    }

    const targetUrl = `${apiBaseUrl.replace(/\/$/, '')}/videos/generations`;

    // console.log('Forwarding video generation request to Colombo AI:', {
    //   url: targetUrl,
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Accept': 'application/json',
    //     'Authorization': `Bearer ${apiKey}`,
    //   },
    //   body: JSON.stringify(body),
    // });

    const colomboAIResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // Important: We still accept JSON
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const responseText = await colomboAIResponse.text(); // Get response as text first
    let responseData;

    // console.log('Received raw response text from Colombo AI:', responseText);
    // console.log('Colombo AI Response Status:', colomboAIResponse.status);


    if (!colomboAIResponse.ok) {
      console.error(`ColomboAI Video API Error (Status: ${colomboAIResponse.status}): ${responseText}`);
      // Try to parse as JSON, it might contain structured error details
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        // If parsing error text as JSON fails, use the raw text as the error message
        return NextResponse.json(
          {
            error: `Failed to generate video. Upstream API returned non-JSON error: ${responseText.substring(0, 500)}`, // Limit length
            status: colomboAIResponse.status
          },
          { status: colomboAIResponse.status }
        );
      }
      // If it was parseable JSON, use that
      return NextResponse.json(
        {
          error: responseData.error || responseData.detail || 'Failed to generate video from upstream API.',
          status_code: responseData.status_code || responseData.status || colomboAIResponse.status, // Include status from Colombo if available
          raw_error: responseText.substring(0, 500) // For client-side debugging if needed
        },
        { status: colomboAIResponse.status }
      );
    }

    // If response.ok is true, we expect valid JSON
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error(`ColomboAI Video API (Status: ${colomboAIResponse.status}) returned OK but non-JSON response: ${responseText}`);
      return NextResponse.json(
        { error: `Upstream API returned OK but with invalid JSON response: ${responseText.substring(0,500)}` },
        { status: 502 } // Bad Gateway, as upstream sent something unexpected
      );
    }

    // console.log('Successfully parsed response from Colombo AI:', responseData);
    return NextResponse.json(responseData, { status: colomboAIResponse.status });

  } catch (error: any) {
    console.error('Error in video proxy API route:', error);
    // This catches network errors for the fetch call itself, or other unexpected errors
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred in video proxy.' },
      { status: 500 }
    );
  }
}
