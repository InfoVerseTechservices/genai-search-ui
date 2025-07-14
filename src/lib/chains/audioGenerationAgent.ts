import { BaseMessage } from '@langchain/core/messages';
import { getCustomOpenaiApiKey, getCustomOpenaiApiUrl } from '../config';

interface AudioGenerationInput {
  chat_history: BaseMessage[];
  query: string;
}

const handleAudioGeneration = async (
  input: AudioGenerationInput,
): Promise<{ audios: string[]; prompt: string }> => {
  const { query } = input;

  const apiKey = getCustomOpenaiApiKey();
  const apiUrl = getCustomOpenaiApiUrl();

  if (!apiKey || !apiUrl) {
    throw new Error('Custom OpenAI API key or URL not configured');
  }

  try {
    const response = await fetch(`${apiUrl}v1/audio/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: query,
        duration_seconds: 10,
        model: 'stabilityai/stable-audio-open-1.0',
      }),
    });

    if (!response.ok) {
      throw new Error(`Audio generation failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    const audios = data.data?.map((item: any) => 
      item.b64_json ? `data:audio/wav;base64,${item.b64_json}` : null
    ).filter(Boolean) || [];

    return {
      audios,
      prompt: query,
    };
  } catch (error) {
    console.error('Audio generation error:', error);
    throw error;
  }
};

export default handleAudioGeneration;