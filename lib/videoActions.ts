// lib/videoActions.ts

// Interface for video generation parameters, based on the API documentation
export interface VideoGenerationParams {
  prompt: string;
  negative_prompt?: string;
  guidance_scale?: number;
  num_frames?: number;
  duration?: number;
  model: "ltx-video"; // Model is fixed as per requirements
  seed?: number;
  width?: number;
  height?: number;
  num_inference_steps?: number;
  decode_timestep?: number;
  decode_noise_scale?: number;
  upscale_and_refine?: boolean;
}

// Interface for the expected video data in the response
interface VideoResponseData {
  b64_json?: string; // Base64 encoded video data
  // Potentially other fields like 'url' if the API might return that
}

// Interface for the API response structure
// This matches the sample response provided, including "processing" status
interface VideoGenerationApiResponse {
  id?: string; // Present in the final response, might not be in "processing"
  object?: string; // e.g., "video.generation"
  created?: number;
  model?: string; // e.g., "wan" (though we send "ltx-video")
  data?: VideoResponseData[]; // Array of video data objects
  status: "processing" | "success" | "failed" | string; // API status
  error?: string; // For error messages from the proxy or API
}

export async function generateVideo(
  params: VideoGenerationParams
): Promise<VideoGenerationApiResponse> {
  // Assuming a local proxy endpoint, similar to image generation
  const proxyApiUrl = '/api/video-proxy';

  // Default values from the API documentation, if not provided by the caller
  const requestBody = {
    prompt: params.prompt,
    negative_prompt: params.negative_prompt || "",
    guidance_scale: params.guidance_scale || 7.5,
    num_frames: params.num_frames || 65,
    duration: params.duration || 1,
    model: params.model, // This is "ltx-video", ensured by the type
    seed: params.seed || 0,
    width: params.width || 768,
    height: params.height || 512,
    num_inference_steps: params.num_inference_steps || 50,
    decode_timestep: params.decode_timestep || 0.03,
    decode_noise_scale: params.decode_noise_scale || 0.025,
    upscale_and_refine: params.upscale_and_refine || false,
  };

  try {
    const response = await fetch(proxyApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // The proxy will handle the actual API key and full API URL
      },
      body: JSON.stringify(requestBody),
    });

    const responseData: VideoGenerationApiResponse = await response.json();

    if (!response.ok) {
      // Use error message from proxy's JSON response if available, or a default
      const errorMessage = responseData.error || responseData.status || `API request via proxy failed with status ${response.status}`;
      console.error('Proxy API Error Response:', responseData);
      // Throw an error that includes the status and message from the API if possible
      throw new Error(`Video generation failed: ${errorMessage} (Status: ${response.status})`);
    }

    // The API might return a "processing" status initially, or the full data.
    // The VideoGenerationPanel will handle these different states.
    return responseData;

  } catch (error) {
    console.error('Error generating video via proxy:', error);
    // Rethrow the error to be caught by the UI component (VideoGenerationPanel)
    // This allows the component to update its error state and notify the user.
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unknown error occurred while generating the video.');
    }
  }
}
