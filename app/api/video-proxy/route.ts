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

    // Ensure the base URL doesn't have a trailing slash, then append the endpoint
    const targetUrl = `${apiBaseUrl.replace(/\/$/, '')}/videos/generations`;

    // Log the request being sent to Colombo AI for debugging purposes
    // console.log('Forwarding video generation request to Colombo AI:', {
    //   url: targetUrl,
    //   method: 'POST',
    //   body: body, // The body already contains all necessary parameters from videoActions.ts
    // });

    const colomboAIResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body), // Forward the client's validated and structured request body
    });

    const responseData = await colomboAIResponse.json();

    // Log the response received from Colombo AI
    // console.log('Received response from Colombo AI:', {
    //   status: colomboAIResponse.status,
    //   data: responseData,
    // });

    if (!colomboAIResponse.ok) {
      console.error('ColomboAI Video API Error:', responseData);
      // Forward the error structure from Colombo AI if available, otherwise a generic message
      return NextResponse.json(
        {
          error: responseData.error || responseData.detail || 'Failed to generate video from upstream API.',
          status: responseData.status // Include status from Colombo if available
        },
        { status: colomboAIResponse.status }
      );
    }

    // Forward the successful response (could be "processing" or actual video data)
    return NextResponse.json(responseData, { status: colomboAIResponse.status });

  } catch (error: any) {
    console.error('Error in video proxy API route:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred in video proxy.' },
      { status: 500 }
    );
  }
}
