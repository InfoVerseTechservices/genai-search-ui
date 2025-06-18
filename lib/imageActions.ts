import toml from 'toml';

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
  model?: string;
  show_thinking?: boolean;
}

interface ApiConfig {
  MODELS: {
    CUSTOM_OPENAI: {
      API_KEY: string;
      API_URL: string;
      MODEL_NAME: string;
    };
  };
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
  model: string;
}

// Function to read and parse config.toml
async function loadConfig(): Promise<ApiConfig> {
  try {
    const response = await fetch('/config.toml'); // Fetch from public folder
    if (!response.ok) {
      throw new Error(`Failed to fetch config.toml: ${response.statusText}`);
    }
    const text = await response.text();
    return toml.parse(text) as ApiConfig;
  } catch (error) {
    console.error('Error loading config.toml:', error);
    // Fallback or default config if loading fails, though API key would be missing
    // For now, rethrow the error as API key is crucial
    throw new Error('Could not load API configuration. Please ensure config.toml exists and is correctly formatted.');
  }
}

export async function generateImage(params: ImageGenerationParams): Promise<ImageGenerationResponse> {
  let apiConfig;
  try {
    apiConfig = await loadConfig();
  } catch (error) {
    // If config loading fails, we cannot proceed.
    // Return a promise that rejects with an error or an error structure.
    // This ensures the calling code can handle this failure.
    console.error("Configuration loading failed:", error);
    return Promise.reject({
        created: Date.now(),
        data: [],
        id: '',
        object: 'error',
        model: '',
        error: 'Failed to load API configuration.',
    });
  }


  const { API_KEY, API_URL, MODEL_NAME } = apiConfig.MODELS.CUSTOM_OPENAI;

  if (!API_KEY) {
    console.error('API_KEY is missing from config.toml');
    return Promise.reject({
        created: Date.now(),
        data: [],
        id: '',
        object: 'error',
        model: '',
        error: 'API Key is missing. Please configure it in config.toml.',
    });
  }

  const apiUrl = `${API_URL}images/generations`;

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
    model: params.model || MODEL_NAME, // Use provided model or default from config
    show_thinking: params.show_thinking,
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.json(); // Or response.text() if not always JSON
      console.error('API Error Response:', errorBody);
      throw new Error(`API request failed with status ${response.status}: ${errorBody.detail || response.statusText}`);
    }

    return await response.json() as ImageGenerationResponse;
  } catch (error) {
    console.error('Error generating image:', error);
    // Ensure the function returns a Promise that rejects or a structured error response
    // to be handled by the caller.
    // For instance, re-throwing the error or returning a specific error object.
    if (error instanceof Error) {
        return Promise.reject({
            created: Date.now(),
            data: [],
            id: '',
            object: 'error',
            model: params.model || MODEL_NAME,
            error: error.message,
        });
    }
    return Promise.reject({
        created: Date.now(),
        data: [],
        id: '',
        object: 'error',
        model: params.model || MODEL_NAME,
        error: 'An unknown error occurred during image generation.',
    });
  }
}
