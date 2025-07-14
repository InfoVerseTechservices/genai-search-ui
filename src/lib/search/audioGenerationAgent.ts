import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { Embeddings } from '@langchain/core/embeddings';
import { BaseMessage } from '@langchain/core/messages';
import eventEmitter from 'events';
import { getCustomOpenaiApiKey, getCustomOpenaiApiUrl } from '../config';

export interface AudioGenerationAgentType {
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

class AudioGenerationAgent implements AudioGenerationAgentType {
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
            data: 'Audio generation is not configured. Please check your Custom OpenAI settings.' 
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
          data: '🎵 Generating your audio, please wait...' 
        }));
      }, 100);

      // Generate audio
      const response = await fetch(`${apiUrl}audio/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt: message,
          duration_seconds: 10.0,
          model: 'stabilityai/stable-audio-open-1.0',
        }),
      });

      if (!response.ok) {
        throw new Error(`Audio generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Audio API Response:', data);
      
      if (data.data?.[0]?.b64_json) {
        const audioData = `data:audio/mpeg;base64,${data.data[0].b64_json}`;
        
        setTimeout(() => {
          emitter.emit('data', JSON.stringify({ 
            type: 'response', 
            data: `<audio controls preload="metadata">\n  <source src="${audioData}" type="audio/mpeg">\n  <source src="${audioData}" type="audio/wav">\n  Your browser does not support the audio element.\n</audio>\n\n*Audio generated for: "${message}"*` 
          }));
          emitter.emit('end');
        }, 200);
      } else {
        console.error('Audio generation response:', data);
        throw new Error('No audio data received');
      }
    } catch (error) {
      console.error('Audio generation error:', error);
      setTimeout(() => {
        emitter.emit('data', JSON.stringify({ 
          type: 'response', 
          data: `I encountered an error while generating the audio: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }));
        emitter.emit('end');
      }, 100);
    }

    return emitter;
  }
}

export default AudioGenerationAgent;