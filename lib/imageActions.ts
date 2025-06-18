// lib/imageActions.ts

interface ImageGenerationParams {
  prompt: string;
  n?: number;
  size?: string;
  response_format?: 'b64_json' | 'url';
  user?: string;
  negative_prompt?: string;
  guidance_scale?: number;
  num_inference_steps?: number;
  height?: number;
  width?: number;
  seed?: number;
  model?: string; // User's choice of model, or empty to use server-side default
  show_thinking?: boolean;
}

// Remove ApiConfigParams interface

interface ImageResponseData {
  b64_json?: string;
  url?: string;
  revised_prompt?: string;
}

interface ImageGenerationResponse {
  created: number;
  data: ImageResponseData[];
  id: string;
  object: string;
  model: string; // Model returned by the API
  error?: string;
}

// generateImage no longer needs apiConfig parameter
export async function generateImage(
  params: ImageGenerationParams
): Promise<ImageGenerationResponse> {
  const proxyApiUrl = '/api/image-proxy'; // Calls our local proxy

  // The requestBody now directly uses params.model.
  // If params.model is empty/undefined, the proxy will use its configured default.
  const requestBody = {
    prompt: params.prompt,
    n: params.n || 1,
    size: params.size || '512x512',
    response_format: params.response_format || 'b64_json',
    user: params.user,
    negative_prompt: params.negative_prompt,
    guidance_scale: params.guidance_scale || 7.5,
    num_inference_steps: params.num_inference_steps || 25,
    height: params.height,
    width: params.width,
    seed: params.seed,
    model: params.model, // Send user's model choice (can be undefined)
    show_thinking: params.show_thinking,
  };

  try {
    const response = await fetch(proxyApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // No Authorization header needed here, proxy handles it
      },
      body: JSON.stringify(requestBody),
    });

    // It's crucial to await response.json() here before checking response.ok
    // because even for errors, the body might contain useful JSON from our proxy
    const responseData = await response.json();

    if (!response.ok) {
      // Use error message from proxy's JSON response if available
      const errorMessage = responseData.error || `API request via proxy failed with status ${response.status}`;
      console.error('Proxy API Error Response:', responseData);
      throw new Error(errorMessage);
    }

    return responseData as ImageGenerationResponse;
  } catch (error) {
    console.error('Error generating image via proxy:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    // Ensure this structure matches what the calling UI expects for errors.
    // The UI typically expects a message string from onGenerationFailure.
    // If generateImage is expected to always resolve, then return a structured error.
    // Here, we rethrow so the catch block in InputPanel handles it.
    throw error; // Rethrow to be caught by InputPanel's catch block
  }
}
