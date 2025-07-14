import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { Embeddings } from '@langchain/core/embeddings';
import { BaseMessage } from '@langchain/core/messages';
import eventEmitter from 'events';
import { getCustomOpenaiApiKey, getCustomOpenaiApiUrl } from '../config';

export interface ImageGenerationAgentType {
  searchAndAnswer: (
    message: string,
    history: BaseMessage[],
    llm: BaseChatModel,
    embeddings: Embeddings,
    optimizationMode: 'speed' | 'balanced' | 'quality',
    fileIds: string[],
    systemInstructions: string,
  ) => Promise<eventEmitter>;
}

class ImageGenerationAgent implements ImageGenerationAgentType {
  async searchAndAnswer(
    message: string,
    history: BaseMessage[],
    llm: BaseChatModel,
    embeddings: Embeddings,
    optimizationMode: 'speed' | 'balanced' | 'quality',
    fileIds: string[],
    systemInstructions: string,
  ) {
    const emitter = new eventEmitter();

    try {
      const apiKey = getCustomOpenaiApiKey();
      const apiUrl = getCustomOpenaiApiUrl();

      if (!apiKey || !apiUrl) {
        setTimeout(() => {
          emitter.emit('data', JSON.stringify({ 
            type: 'response', 
            data: 'Image generation is not configured. Please check your Custom OpenAI settings.' 
          }));
          emitter.emit('end');
        }, 100);
        return emitter;
      }

      // Emit sources first to trigger message appearance
      setTimeout(() => {
        emitter.emit('data', JSON.stringify({ 
          type: 'sources', 
          data: [] 
        }));
      }, 50);
      
      // Show generating message
      setTimeout(() => {
        emitter.emit('data', JSON.stringify({ 
          type: 'message', 
          data: '🎨 Generating your image, please wait...' 
        }));
      }, 100);

      // Generate image
      const response = await fetch(`${apiUrl}images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt: message,
          response_format: 'b64_json',
          model: 'flux',
          width: 1024,
          height: 1024,
          num_inference_steps: 50,
          guidance_scale: 7.5,
        }),
      });

      if (!response.ok) {
        throw new Error(`Image generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.data?.[0]?.b64_json) {
        const imageData = `data:image/png;base64,${data.data[0].b64_json}`;
        
        setTimeout(() => {
          emitter.emit('data', JSON.stringify({ 
            type: 'response', 
            data: `![Generated Image](${imageData})\n\n*Image generated for: "${message}"*` 
          }));
          emitter.emit('end');
        }, 200);
      } else {
        throw new Error('No image data received');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      setTimeout(() => {
        emitter.emit('data', JSON.stringify({ 
          type: 'response', 
          data: `I encountered an error while generating the image: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }));
        emitter.emit('end');
      }, 100);
    }

    return emitter;
  }
}

export default ImageGenerationAgent;