// lib/audioActions.ts

export interface AudioGenParams {
  prompt: string;
  negative_prompt?: string;
  duration_seconds?: number;
  seed?: number;
  model?: string;
}

// Based on the example response (may need adjustment if actual API differs)
interface AudioResponseData {
  b64_json?: string; // Assuming audio data is base64 encoded
  url?: string | null;
  revised_prompt?: string | null;
}

export interface AudioGenerationResponse {
  created: number;
  data: AudioResponseData[];
  id: string; // Example showed "img-..." might be different for audio
  object: string; // Example showed "image.generation", might be "audio.generation"
  model: string; // Example showed an image model
  error?: string; // For handling errors from the proxy or API
}

// lib/audioActions.ts (continued)

export async function generateAudio(
  params: AudioGenParams
): Promise<AudioGenerationResponse> {
  const proxyApiUrl = '/api/audio-proxy'; // Calls our local audio proxy

  // Request body for the proxy will be the params directly.
  // The proxy will handle merging with defaults if necessary.
  const requestBody = {
    prompt: params.prompt,
    negative_prompt: params.negative_prompt,
    duration_seconds: params.duration_seconds,
    seed: params.seed,
    model: params.model, // Client can specify model, or proxy uses its default
  };

  try {
    const response = await fetch(proxyApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseData: AudioGenerationResponse = await response.json();

    if (!response.ok) {
      // Use error message from proxy's JSON response if available
      const errorMessage = responseData.error || `Audio generation via proxy failed with status ${response.status}`;
      console.error('Audio Proxy API Error Response:', responseData);
      // Throw an error that includes the structured error message if possible
      const error = new Error(errorMessage) as any;
      error.response = responseData; // Attach full response for more context if needed
      throw error;
    }

    return responseData;
  } catch (error: any) {
    console.error('Error generating audio via proxy:', error);
    // Rethrow or return a structured error compatible with how UI handles it
    // If error.response exists, it means it's likely an error structure from our proxy
    if (error.response) {
      throw error; // Propagate the structured error
    }
    // Otherwise, create a new one
    const newError = new Error(error.message || 'An unknown error occurred during audio generation.') as any;
    newError.isNetworkError = true; // Optional: flag network type errors
    throw newError;
  }
}
