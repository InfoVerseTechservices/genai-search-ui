import { BaseMessage } from '@langchain/core/messages';
import { getCustomOpenaiApiKey, getCustomOpenaiApiUrl } from '../config';

interface ImageGenerationInput {
  chat_history: BaseMessage[];
  query: string;
}

const handleImageGeneration = async (
  input: ImageGenerationInput,
): Promise<{ images: string[]; prompt: string }> => {
  const { query } = input;

  const apiKey = getCustomOpenaiApiKey();
  const apiUrl = getCustomOpenaiApiUrl();

  if (!apiKey || !apiUrl) {
    throw new Error('Custom OpenAI API key or URL not configured');
  }

  try {
    const response = await fetch(`${apiUrl}images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: query,
        response_format: 'b64_json',
        model: 'flux',
        size: '1024x1024',
      }),
    });

    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    const images = data.data?.map((item: any) => 
      item.b64_json ? `data:image/png;base64,${item.b64_json}` : null
    ).filter(Boolean) || [];

    return {
      images,
      prompt: query,
    };
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
};

export default handleImageGeneration;