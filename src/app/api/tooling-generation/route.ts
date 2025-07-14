import { NextRequest, NextResponse } from 'next/server';
import { getConfig } from '@/lib/config';
import { getModelForFunction } from '@/lib/modelSelector';
import connectDB from '@/lib/db';
import { Message, Chat } from '@/lib/db/schema';
import crypto from 'crypto';
import { getUserId } from '@/lib/cookies';

// Helper function to ensure chat exists and save user message
async function ensureChatAndSaveUserMessage(chatId: string, userMessageId: string, userContent: string, userId?: string) {
  try {
    await connectDB();
    console.log('Ensuring chat exists and saving user message from tooling API:', userMessageId, chatId);
    
    // Check if chat exists, if not create it
    const existingChat = await Chat.findOne({ id: chatId });
    if (!existingChat) {
      console.log('Creating new chat record:', chatId);
      const words = userContent.trim().split(/\s+/);
      const title = words.slice(0, Math.min(6, words.length)).join(' ');
      
      const newChat = new Chat({
        id: chatId,
        title: title || 'New Chat',
        userId: userId,
        focusMode: 'webSearch',
        files: [],
        updatedAt: new Date()
      });
      await newChat.save();
      console.log('Chat record created successfully');
    }
    
    // Save user message
    const userMessage = new Message({
      messageId: userMessageId,
      chatId: chatId,
      content: userContent,
      role: 'user',
      metadata: {},
    });
    await userMessage.save();
    
    console.log('User message saved successfully from tooling API');
  } catch (error) {
    console.error('Error saving user message from tooling API:', error);
  }
}

// Helper function to save assistant response
async function saveAssistantResponse(chatId: string, assistantMessageId: string, content: string, metadata: any = {}) {
  try {
    await connectDB();
    console.log('Saving assistant response from tooling API:', assistantMessageId, chatId);
    
    const assistantMessage = new Message({
      messageId: assistantMessageId,
      chatId: chatId,
      content: content,
      role: 'assistant',
      metadata: metadata,
    });
    await assistantMessage.save();
    
    // Update chat timestamp
    await Chat.findOneAndUpdate(
      { id: chatId },
      { updatedAt: new Date() }
    );
    
    console.log('Assistant response saved successfully from tooling API');
  } catch (error) {
    console.error('Error saving assistant response from tooling API:', error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    // Extract chatId and messageId from URL or body
    const url = new URL(req.url);
    const chatId = url.searchParams.get('chatId') || body.chatId;
    const messageId = url.searchParams.get('messageId') || body.messageId || crypto.randomBytes(7).toString('hex');
    const userContent = body.messages?.[0]?.content || '';
    
    const config = getConfig();
    
    const customOpenAI = config.MODELS.CUSTOM_OPENAI;
    
    if (!customOpenAI.API_KEY || !customOpenAI.API_URL) {
      console.error('Missing API configuration');
      return NextResponse.json(
        { error: 'Custom OpenAI API configuration not found' },
        { status: 400 }
      );
    }

    const requestPayload = {
      input: body.messages || body.input,
      instructions: "Be as creative and imaginative as possible.",
      model: "mc-1",
      temperature: body.temperature || 1,
      top_p: 1,
      stop: [],
      max_output_tokens: body.max_output_tokens || 1024,
      include: [],
      stream: body.stream || true,
      enable_thinking: body.enable_thinking || false,
      tools: body.tools || [],
    };
    
    console.log('Sending to API:', JSON.stringify(requestPayload, null, 2));
    console.log('API URL:', `${customOpenAI.API_URL}responses`);

    const response = await fetch(`${customOpenAI.API_URL}responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customOpenAI.API_KEY}`,
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: `${customOpenAI.API_URL}responses`
      });
      return NextResponse.json(
        { error: `API Error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    if (body.stream) {
      // Save user message immediately
      if (chatId && userContent.trim().length > 0) {
        const userId = req.headers.get('x-user-id') || undefined;
        await ensureChatAndSaveUserMessage(chatId, messageId, userContent, userId);
      }
      
      // Create a transform stream to capture the response content
      let assistantContent = '';
      const assistantMessageId = crypto.randomBytes(7).toString('hex');
      
      const transformStream = new TransformStream({
        transform(chunk, controller) {
          const text = new TextDecoder().decode(chunk);
          
          // Parse streaming response to extract content
          const lines = text.split('\n').filter(line => line.trim());
          for (const line of lines) {
            try {
              let jsonData;
              if (line.startsWith('data: ')) {
                jsonData = JSON.parse(line.substring(6));
              } else if (line.startsWith('[status]')) {
                jsonData = JSON.parse(line.replace('[status] ', ''));
              } else {
                jsonData = JSON.parse(line);
              }
              
              if (jsonData.output_text_delta?.text) {
                assistantContent += jsonData.output_text_delta.text;
              }
            } catch (e) {
              // Skip parsing errors
            }
          }
          
          controller.enqueue(chunk);
        },
        flush() {
          // Save assistant response when stream ends
          if (chatId && assistantContent.trim().length > 0) {
            saveAssistantResponse(chatId, assistantMessageId, assistantContent);
          }
        }
      });
      
      return new Response(response.body?.pipeThrough(transformStream), {
        headers: {
          'Content-Type': 'text/plain',
          'Transfer-Encoding': 'chunked',
        },
      });
    }

    const data = await response.json();
    
    // Save messages for non-streaming responses
    if (chatId && userContent.trim().length > 0) {
      const userId = req.headers.get('x-user-id') || undefined;
      await ensureChatAndSaveUserMessage(chatId, messageId, userContent, userId);
      
      // Save assistant response
      if (data.output_text || data.content) {
        const assistantMessageId = crypto.randomBytes(7).toString('hex');
        await saveAssistantResponse(chatId, assistantMessageId, data.output_text || data.content);
      }
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in tooling generation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}