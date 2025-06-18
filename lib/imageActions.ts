// lib/imageActions.ts

// Remove: import toml from 'toml';

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
  model?: string; // This model is the user's choice, overriding default if provided
  show_thinking?: boolean;
}

// Interface for the API configuration passed to generateImage
export interface ApiConfigParams {
  apiKey: string;
  apiUrl: string;
  defaultModel: string;
}

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
  model: string; // This model is the one returned by the API
  error?: string; // Added for structured error responses
}

// Remove the ApiConfig interface (related to toml parsing)
// Remove the loadConfig function

export async function generateImage(
  params: ImageGenerationParams,
  apiConfig: ApiConfigParams
): Promise<ImageGenerationResponse> {
  const { apiKey, apiUrl: baseUrl, defaultModel } = apiConfig;

  if (!apiKey) {
    console.error('API_KEY is missing.');
    return Promise.reject({
      created: Date.now(),
      data: [],
      id: '',
      object: 'error',
      model: params.model || defaultModel,
      error: 'API Key is missing. Please configure it in environment variables.',
    });
  }

  if (!baseUrl) {
    console.error('API_URL is missing.');
    return Promise.reject({
        created: Date.now(),
        data: [],
        id: '',
        object: 'error',
        model: params.model || defaultModel,
        error: 'API URL is missing. Please configure it in environment variables.',
    });
  }

  const apiUrl = `${baseUrl.replace(/\/$/, '')}/images/generations`; // Ensure no double slashes

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
    model: params.model || defaultModel, // Use user-provided model or the default from env
    show_thinking: params.show_thinking,
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('API Error Response:', errorBody);
      throw new Error(
        `API request failed with status ${response.status}: ${errorBody.detail || response.statusText}`
      );
    }

    return (await response.json()) as ImageGenerationResponse;
  } catch (error) {
    console.error('Error generating image:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during image generation.';
    return Promise.reject({
      created: Date.now(),
      data: [],
      id: '',
      object: 'error',
      model: params.model || defaultModel,
      error: errorMessage,
    });
  }
}
