import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { Embeddings } from '@langchain/core/embeddings';
import { ChatOpenAI } from '@langchain/openai';
import {
  getAvailableChatModelProviders,
  getAvailableEmbeddingModelProviders,
} from '@/lib/providers';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { searchHandlers } from '@/lib/search';
import { getModelForFunction } from '@/lib/modelSelector';
import {
  getCustomOpenaiApiKey,
  getCustomOpenaiApiUrl,
  getCustomOpenaiModelName,
} from '@/lib/config';
import connectDB from '@/lib/db';
import { Message, Chat } from '@/lib/db/schema';
import crypto from 'crypto';

interface ChatRequestBody {
  content: string;
  message: {
    messageId: string;
    chatId: string;
    content: string;
  };
  chatId: string;
  files: string[];
  focusMode: string;
  optimizationMode: 'speed' | 'balanced';
  history: Array<[string, string]>;
  chatModel: {
    name: string;
    provider: string;
  };
  embeddingModel: {
    name: string;
    provider: string;
  };
  systemInstructions?: string;
}

export const POST = async (req: Request) => {
  try {
    const body: ChatRequestBody = await req.json();

    if (!body.focusMode || !body.content) {
      return Response.json(
        { message: 'Missing focus mode or content' },
        { status: 400 },
      );
    }

    // Dynamic model selection based on focus mode
    const modelConfig = getModelForFunction(body.focusMode);
    console.log(`Using model ${modelConfig.model} for ${body.focusMode}`);

    const history: BaseMessage[] = body.history.map((msg) => {
      return msg[0] === 'human'
        ? new HumanMessage({ content: msg[1] })
        : new AIMessage({ content: msg[1] });
    });

    const [chatModelProviders, embeddingModelProviders] = await Promise.all([
      getAvailableChatModelProviders(),
      getAvailableEmbeddingModelProviders(),
    ]);

    let llm: BaseChatModel | undefined;
    let embeddings: Embeddings | undefined;

    // Use custom OpenAI for model selection
    if (body.chatModel?.provider === 'custom_openai' || modelConfig.model) {
      llm = new ChatOpenAI({
        modelName: modelConfig.model || body.chatModel?.name || getCustomOpenaiModelName(),
        openAIApiKey: getCustomOpenaiApiKey(),
        temperature: 0.7,
        configuration: {
          baseURL: getCustomOpenaiApiUrl(),
        },
      }) as unknown as BaseChatModel;
    } else if (
      chatModelProviders[body.chatModel.provider] &&
      chatModelProviders[body.chatModel.provider][body.chatModel.name]
    ) {
      llm = chatModelProviders[body.chatModel.provider][body.chatModel.name]
        .model as unknown as BaseChatModel | undefined;
    }

    if (
      embeddingModelProviders[body.embeddingModel.provider] &&
      embeddingModelProviders[body.embeddingModel.provider][body.embeddingModel.name]
    ) {
      embeddings = embeddingModelProviders[body.embeddingModel.provider][
        body.embeddingModel.name
      ].model as Embeddings | undefined;
    }

    if (!llm) {
      return Response.json(
        { message: 'Invalid chat model selected' },
        { status: 400 },
      );
    }

    if (!embeddings) {
      console.warn('No embedding model available, using fallback');
      // Create a dummy embedding for compatibility
      embeddings = {
        embedQuery: async () => new Array(384).fill(0),
        embedDocuments: async () => [new Array(384).fill(0)]
      } as any;
    }

    // User message will be saved only when response is successfully generated

    const searchHandler = searchHandlers[body.focusMode];

    if (!searchHandler) {
      return Response.json({ message: 'Invalid focus mode' }, { status: 400 });
    }

    const emitter = await searchHandler.searchAndAnswer(
      body.content,
      history,
      llm,
      embeddings as Embeddings,
      body.optimizationMode,
      body.files || [],
      body.systemInstructions || '',
    );

    const encoder = new TextEncoder();
    const abortController = new AbortController();
    const { signal } = abortController;

    const stream = new ReadableStream({
      start(controller) {
        let assistantMessage = '';
        let sources: any[] = [];
        const assistantMessageId = crypto.randomBytes(7).toString('hex');

        signal.addEventListener('abort', () => {
          emitter.removeAllListeners();
          try {
            controller.close();
          } catch (error) {}
        });

        emitter.on('data', (data: string) => {
          if (signal.aborted) return;

          try {
            const parsedData = JSON.parse(data);

            if (parsedData.type === 'sources') {
              sources = parsedData.data;
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    type: 'sources',
                    data: sources,
                    messageId: assistantMessageId,
                  }) + '\n',
                ),
              );
            } else if (parsedData.type === 'response' || parsedData.type === 'message') {
              assistantMessage += parsedData.data;
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    type: 'message',
                    data: parsedData.data,
                    messageId: assistantMessageId,
                  }) + '\n',
                ),
              );
            }
          } catch (error) {
            controller.error(error);
          }
        });

        emitter.on('end', async () => {
          if (signal.aborted) return;

          // Save both user and assistant messages only when response is generated
          if (assistantMessage.trim().length > 0) {
            try {
              await connectDB();
              console.log('Saving user and assistant messages:', body.message.messageId, assistantMessageId, body.chatId);
              
              // Save user message
              const userMessage = new Message({
                messageId: body.message.messageId,
                chatId: body.chatId,
                content: body.content,
                role: 'user',
                metadata: {},
              });
              await userMessage.save();
              
              // Save assistant message
              const assistantMsg = new Message({
                messageId: assistantMessageId,
                chatId: body.chatId,
                content: assistantMessage,
                role: 'assistant',
                metadata: { sources },
              });
              await assistantMsg.save();
              
              // Update chat title if this is the first message and update timestamp
              const existingMessages = await Message.find({ chatId: body.chatId }).countDocuments();
              if (existingMessages <= 2) { // First user + assistant message pair
                // Generate title from first 5-6 words of user message
                const words = body.content.trim().split(/\s+/);
                const title = words.slice(0, Math.min(6, words.length)).join(' ');
                
                await Chat.findOneAndUpdate(
                  { id: body.chatId },
                  { 
                    title: title,
                    updatedAt: new Date()
                  }
                );
              } else {
                // Just update timestamp for existing chats
                await Chat.findOneAndUpdate(
                  { id: body.chatId },
                  { updatedAt: new Date() }
                );
              }
              
              console.log('Both messages saved successfully');
            } catch (error) {
              console.error('Error saving messages:', error);
            }
          }

          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: 'messageEnd',
                messageId: assistantMessageId,
              }) + '\n',
            ),
          );
          controller.close();
        });

        emitter.on('error', (error: any) => {
          if (signal.aborted) return;
          controller.error(error);
        });
      },
      cancel() {
        abortController.abort();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (err: any) {
    console.error(`Error in chat: ${err.message}`);
    return Response.json(
      { message: 'An error has occurred.' },
      { status: 500 },
    );
  }
};