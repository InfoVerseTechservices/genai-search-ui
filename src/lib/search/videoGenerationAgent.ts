import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { Embeddings } from '@langchain/core/embeddings';
import { BaseMessage } from '@langchain/core/messages';
import eventEmitter from 'events';

export interface VideoGenerationAgentType {
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

class VideoGenerationAgent implements VideoGenerationAgentType {
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
    
    setTimeout(() => {
      emitter.emit('data', JSON.stringify({ 
        type: 'sources', 
        data: []
      }));
    }, 50);
    
    setTimeout(() => {
      emitter.emit('data', JSON.stringify({ 
        type: 'response', 
        data: '🎬 Generating your video, please wait...'
      }));
    }, 100);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/generate-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: message,
          duration: 3,
          guidance_scale: 9.0,
          num_frames: 120,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.data?.[0]?.b64_json) {
        const videoData = `data:video/mp4;base64,${data.data[0].b64_json}`;
        console.log('Video generated successfully');
        
        setTimeout(() => {
          emitter.emit('data', JSON.stringify({ 
            type: 'response', 
            data: `\n\n<video controls style="width: 100%; max-width: 600px; border-radius: 8px; margin: 10px 0;"><source src="${videoData}" type="video/mp4">Your browser does not support the video tag.</video>\n\n*Video generated for: "${message}"*`
          }));
          emitter.emit('end');
        }, 200);
      } else {
        setTimeout(() => {
          emitter.emit('data', JSON.stringify({ 
            type: 'response', 
            data: '\n\nVideo generation failed: ' + (data.error || 'Unknown error')
          }));
          emitter.emit('end');
        }, 200);
      }
    } catch (error) {
      console.error('Video generation error:', error);
      setTimeout(() => {
        emitter.emit('data', JSON.stringify({ 
          type: 'response', 
          data: `\n\nVideo generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }));
        emitter.emit('end');
      }, 200);
    }
    
    return emitter;
  }
}

export default VideoGenerationAgent;