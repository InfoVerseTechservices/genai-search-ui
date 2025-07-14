import { getCustomOpenaiApiKey, getCustomOpenaiApiUrl } from '@/lib/config';

interface ImageGenerationBody {
  prompt: string;
  negative_prompt?: string;
  size?: string;
  width?: number;
  height?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
  response_format?: 'b64_json' | 'png';
  model?: string;
}

export const POST = async (req: Request) => {
  try {
    const body: ImageGenerationBody = await req.json();

    const apiKey = getCustomOpenaiApiKey();
    const apiUrl = getCustomOpenaiApiUrl();

    if (!apiKey || !apiUrl) {
      return Response.json(
        { error: 'Custom OpenAI API key or URL not configured' },
        { status: 400 }
      );
    }

    const requestBody = {
      prompt: body.prompt,
      negative_prompt: body.negative_prompt || '',
      size: body.size || '1024x1024',
      width: body.width || 1024,
      height: body.height || 1024,
      guidance_scale: body.guidance_scale || 7.5,
      num_inference_steps: body.num_inference_steps || 50,
      response_format: body.response_format || 'b64_json',
      model: body.model || 'flux',
    };

    const response = await fetch(`${apiUrl}images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Image generation API error:', errorData);
      return Response.json(
        { error: 'Failed to generate image' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data, { status: 200 });
  } catch (err) {
    console.error('Image generation error:', err);
    return Response.json(
      { error: 'An error occurred while generating image' },
      { status: 500 }
    );
  }
};