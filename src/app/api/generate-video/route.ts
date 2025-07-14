import { getCustomOpenaiApiKey, getCustomOpenaiApiUrl } from '@/lib/config';

interface VideoGenerationBody {
  prompt: string;
  negative_prompt?: string;
  guidance_scale?: number;
  num_frames?: number;
  duration?: number;
  model?: string;
}

export const POST = async (req: Request) => {
  try {
    const body: VideoGenerationBody = await req.json();

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
      guidance_scale: body.guidance_scale || 9.0,
      num_frames: body.num_frames || 120,
      duration: body.duration,
      model: body.model || 'wan',
    };

    const response = await fetch(`${apiUrl}videos/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Video generation API error:', errorData);
      return Response.json(
        { error: 'Failed to generate video' },
        { status: response.status }
      );
    }

    // Handle streaming response
    const fullResponse = await response.text();
    const lines = fullResponse.split('\n');
    
    // Find the last line with video data
    for (const line of lines.reverse()) {
      if (line.trim() && line.includes('b64_json')) {
        try {
          const jsonStr = line.replace(/^data: /, '').trim();
          const data = JSON.parse(jsonStr);
          return Response.json(data, { status: 200 });
        } catch (e) {
          continue;
        }
      }
    }
    
    return Response.json({ error: 'No video data found' }, { status: 500 });
  } catch (err) {
    console.error('Video generation error:', err);
    return Response.json(
      { error: 'An error occurred while generating video' },
      { status: 500 }
    );
  }
};