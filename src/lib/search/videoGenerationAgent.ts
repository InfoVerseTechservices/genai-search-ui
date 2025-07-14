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
    const messageId = require('crypto').randomBytes(7).toString('hex');
    
    // Emit sources immediately
    emitter.emit('data', JSON.stringify({ 
      type: 'sources', 
      data: [],
      messageId 
    }));
    
    // Show loading message
    emitter.emit('data', JSON.stringify({ 
      type: 'message', 
      data: '🎬 Generating your video, please wait...',
      messageId 
    }));

    try {
      // Call the working API directly
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
        
        // Replace the loading message with video
        emitter.emit('data', JSON.stringify({ 
          type: 'message', 
          data: `<video controls style="width: 100%; max-width: 600px; border-radius: 8px;"><source src="${videoData}" type="video/mp4">Your browser does not support the video tag.</video>\n\n*Video generated for: "${message}"*`,
          messageId 
        }));
      } else {
        emitter.emit('data', JSON.stringify({ 
          type: 'message', 
          data: 'Video generation failed: ' + (data.error || 'Unknown error'),
          messageId 
        }));
      }
    } catch (error) {
      console.error('Video generation error:', error);
      emitter.emit('data', JSON.stringify({ 
        type: 'message', 
        data: `Video generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        messageId 
      }));
    }

    emitter.emit('data', JSON.stringify({ 
      type: 'messageEnd',
      messageId 
    }));
    emitter.emit('end');
    
    return emitter;
  }
}

export default VideoGenerationAgent;