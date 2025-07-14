'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Document } from '@langchain/core/documents';
import Navbar from './Navbar';
import Chat from './Chat';
import EmptyChat from './EmptyChat';
import crypto from 'crypto';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { getSuggestions } from '@/lib/actions';
import { Settings } from 'lucide-react';
import Link from 'next/link';
import NextError from 'next/error';

export type Message = {
  messageId: string;
  chatId: string;
  createdAt: Date;
  content: string;
  role: 'user' | 'assistant';
  suggestions?: string[];
  sources?: Document[];
};

export interface File {
  fileName: string;
  fileExtension: string;
  fileId: string;
}

interface ChatModelProvider {
  name: string;
  provider: string;
}

interface EmbeddingModelProvider {
  name: string;
  provider: string;
}

const checkConfig = async (
  setChatModelProvider: (provider: ChatModelProvider) => void,
  setEmbeddingModelProvider: (provider: EmbeddingModelProvider) => void,
  setIsConfigReady: (ready: boolean) => void,
  setHasError: (hasError: boolean) => void,
) => {
  try {
    let chatModel = localStorage.getItem('chatModel');
    let chatModelProvider = localStorage.getItem('chatModelProvider');
    let embeddingModel = localStorage.getItem('embeddingModel');
    let embeddingModelProvider = localStorage.getItem('embeddingModelProvider');

    const autoImageSearch = localStorage.getItem('autoImageSearch');
    const autoVideoSearch = localStorage.getItem('autoVideoSearch');

    if (!autoImageSearch) {
      localStorage.setItem('autoImageSearch', 'true');
    }

    if (!autoVideoSearch) {
      localStorage.setItem('autoVideoSearch', 'false');
    }

    const providers = await fetch(`/api/models`, {
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(async (res) => {
      if (!res.ok)
        throw new Error(
          `Failed to fetch models: ${res.status} ${res.statusText}`,
        );
      return res.json();
    });

    if (
      !chatModel ||
      !chatModelProvider ||
      !embeddingModel ||
      !embeddingModelProvider
    ) {
      if (!chatModel || !chatModelProvider) {
        const chatModelProviders = providers.chatModelProviders;
        const chatModelProvidersKeys = Object.keys(chatModelProviders);

        if (!chatModelProviders || chatModelProvidersKeys.length === 0) {
          return toast.error('No chat models available');
        } else {
          chatModelProvider =
            chatModelProvidersKeys.find(
              (provider) =>
                Object.keys(chatModelProviders[provider]).length > 0,
            ) || chatModelProvidersKeys[0];
        }

        if (
          chatModelProvider === 'custom_openai' &&
          Object.keys(chatModelProviders[chatModelProvider]).length === 0
        ) {
          toast.error(
            "Looks like you haven't configured any chat model providers. Please configure them from the settings page or the config file.",
          );
          return setHasError(true);
        }

        chatModel = Object.keys(chatModelProviders[chatModelProvider])[0];
      }

      if (!embeddingModel || !embeddingModelProvider) {
        const embeddingModelProviders = providers.embeddingModelProviders;

        if (
          !embeddingModelProviders ||
          Object.keys(embeddingModelProviders).length === 0
        )
          return toast.error('No embedding models available');

        embeddingModelProvider = Object.keys(embeddingModelProviders)[0];
        embeddingModel = Object.keys(
          embeddingModelProviders[embeddingModelProvider],
        )[0];
      }

      localStorage.setItem('chatModel', chatModel!);
      localStorage.setItem('chatModelProvider', chatModelProvider);
      localStorage.setItem('embeddingModel', embeddingModel!);
      localStorage.setItem('embeddingModelProvider', embeddingModelProvider);
    } else {
      const chatModelProviders = providers.chatModelProviders;
      const embeddingModelProviders = providers.embeddingModelProviders;

      if (
        Object.keys(chatModelProviders).length > 0 &&
        (!chatModelProviders[chatModelProvider] ||
          Object.keys(chatModelProviders[chatModelProvider]).length === 0)
      ) {
        const chatModelProvidersKeys = Object.keys(chatModelProviders);
        chatModelProvider =
          chatModelProvidersKeys.find(
            (key) => Object.keys(chatModelProviders[key]).length > 0,
          ) || chatModelProvidersKeys[0];

        localStorage.setItem('chatModelProvider', chatModelProvider);
      }

      if (
        chatModelProvider &&
        !chatModelProviders[chatModelProvider][chatModel]
      ) {
        if (
          chatModelProvider === 'custom_openai' &&
          Object.keys(chatModelProviders[chatModelProvider]).length === 0
        ) {
          toast.error(
            "Looks like you haven't configured any chat model providers. Please configure them from the settings page or the config file.",
          );
          return setHasError(true);
        }

        chatModel = Object.keys(
          chatModelProviders[
            Object.keys(chatModelProviders[chatModelProvider]).length > 0
              ? chatModelProvider
              : Object.keys(chatModelProviders)[0]
          ],
        )[0];

        localStorage.setItem('chatModel', chatModel);
      }

      if (
        Object.keys(embeddingModelProviders).length > 0 &&
        !embeddingModelProviders[embeddingModelProvider]
      ) {
        embeddingModelProvider = Object.keys(embeddingModelProviders)[0];
        localStorage.setItem('embeddingModelProvider', embeddingModelProvider);
      }

      if (
        embeddingModelProvider &&
        !embeddingModelProviders[embeddingModelProvider][embeddingModel]
      ) {
        embeddingModel = Object.keys(
          embeddingModelProviders[embeddingModelProvider],
        )[0];
        localStorage.setItem('embeddingModel', embeddingModel);
      }
    }

    setChatModelProvider({
      name: chatModel!,
      provider: chatModelProvider,
    });

    setEmbeddingModelProvider({
      name: embeddingModel!,
      provider: embeddingModelProvider,
    });

    setIsConfigReady(true);
  } catch (err) {
    console.error('An error occurred while checking the configuration:', err);
    setIsConfigReady(false);
    setHasError(true);
  }
};

const loadMessages = async (
  chatId: string,
  setMessages: (messages: Message[]) => void,
  setIsMessagesLoaded: (loaded: boolean) => void,
  setChatHistory: (history: [string, string][]) => void,
  setFocusMode: (mode: string) => void,
  setNotFound: (notFound: boolean) => void,
  setFiles: (files: File[]) => void,
  setFileIds: (fileIds: string[]) => void,
) => {
  console.log('Loading messages for chatId:', chatId);
  
  const res = await fetch(`/api/chats/${chatId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log('API response status:', res.status);

  if (res.status === 404) {
    console.log('Chat not found, setting notFound to true');
    setNotFound(true);
    setIsMessagesLoaded(true);
    return;
  }

  if (!res.ok) {
    console.error('API error:', res.status, res.statusText);
    setNotFound(true);
    setIsMessagesLoaded(true);
    return;
  }

  const data = await res.json();
  console.log('API response data:', data);

  const messages = data.messages.map((msg: any) => {
    const messageData = {
      ...msg,
      ...(typeof msg.metadata === 'string' ? JSON.parse(msg.metadata) : msg.metadata),
    };
    
    // Clean duplicate content from loaded messages
    if (messageData.role === 'assistant' && messageData.content) {
      let content = messageData.content;
      
      // Remove artifacts
      content = content.replace(/\[Generating response\.\.\.\]/g, '');
      
      // Split content in half and check if it's duplicated
      const midPoint = Math.floor(content.length / 2);
      const firstHalf = content.substring(0, midPoint).trim();
      const secondHalf = content.substring(midPoint).trim();
      
      // If second half starts with first half, it's likely a duplicate
      if (secondHalf.startsWith(firstHalf) && firstHalf.length > 50) {
        content = firstHalf;
      }
      
      messageData.content = content.trim();
    }
    
    return messageData;
  }) as Message[];

  setMessages(messages);

  const history = messages.map((msg) => {
    return [msg.role, msg.content];
  }) as [string, string][];

  console.debug(new Date(), 'app:messages_loaded');

  if (messages.length > 0) {
    document.title = messages[0].content;
  }

  const files = data.chat.files.map((file: any) => {
    return {
      fileName: file.name,
      fileExtension: file.name.split('.').pop(),
      fileId: file.fileId,
    };
  });

  setFiles(files);
  setFileIds(files.map((file: File) => file.fileId));

  setChatHistory(history);
  setFocusMode(data.chat.focusMode);
  setIsMessagesLoaded(true);
};

const ChatWindow = ({ id }: { id?: string }) => {
  const searchParams = useSearchParams();
  const initialMessage = searchParams.get('q');

  const [chatId, setChatId] = useState<string | undefined>(id);
  const [newChatCreated, setNewChatCreated] = useState(false);

  const [chatModelProvider, setChatModelProvider] = useState<ChatModelProvider>(
    {
      name: '',
      provider: '',
    },
  );

  const [embeddingModelProvider, setEmbeddingModelProvider] =
    useState<EmbeddingModelProvider>({
      name: '',
      provider: '',
    });

  const [isConfigReady, setIsConfigReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    checkConfig(
      setChatModelProvider,
      setEmbeddingModelProvider,
      setIsConfigReady,
      setHasError,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [loading, setLoading] = useState(false);
  const [messageAppeared, setMessageAppeared] = useState(false);

  const [chatHistory, setChatHistory] = useState<[string, string][]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const [files, setFiles] = useState<File[]>([]);
  const [fileIds, setFileIds] = useState<string[]>([]);

  const [focusMode, setFocusMode] = useState('webSearch');
  const [optimizationMode, setOptimizationMode] = useState('speed');

  const [isMessagesLoaded, setIsMessagesLoaded] = useState(false);

  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (
      chatId &&
      !newChatCreated &&
      !isMessagesLoaded &&
      messages.length === 0
    ) {
      console.log('Triggering loadMessages for chatId:', chatId);
      loadMessages(
        chatId,
        setMessages,
        setIsMessagesLoaded,
        setChatHistory,
        setFocusMode,
        setNotFound,
        setFiles,
        setFileIds,
      );
    } else if (!chatId) {
      setNewChatCreated(true);
      setIsMessagesLoaded(true);
      setChatId(crypto.randomBytes(20).toString('hex'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, isMessagesLoaded]);

  const messagesRef = useRef<Message[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (isMessagesLoaded && isConfigReady) {
      setIsReady(true);
      console.debug(new Date(), 'app:ready');
    } else {
      setIsReady(false);
    }
  }, [isMessagesLoaded, isConfigReady]);

  const sendMessage = async (message: string, isGenerationMode?: boolean, useTooling?: boolean, messageId?: string) => {
    if (loading) return;
    if (!isConfigReady) {
      toast.error('Cannot send message before the configuration is ready');
      return;
    }

    // Immediately redirect to chat URL and show user message
    if (window.location.pathname === '/') {
      window.history.replaceState({}, '', `/c/${chatId}`);
    }

    // Immediately add user message to UI
    const userMessageId = messageId ?? crypto.randomBytes(7).toString('hex');
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        content: message,
        messageId: userMessageId,
        chatId: chatId!,
        role: 'user',
        createdAt: new Date(),
      },
    ]);

    setLoading(true);
    setMessageAppeared(false);

    let sources: Document[] | undefined = undefined;
    let recievedMessage = '';
    let added = false;
    let responseGenerated = false;
    let processedChunks = new Set<string>();

    messageId = userMessageId;

    // Store original clean message, prevent tooling artifacts from contaminating it
    const originalMessage = message;

    const messageHandler = async (data: any) => {
      if (data.type === 'error') {
        toast.error(data.data);
        setLoading(false);
        return;
      }

      if (data.type === 'sources') {
        sources = data.data;
        if (!added) {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              content: '',
              messageId: data.messageId,
              chatId: chatId!,
              role: 'assistant',
              sources: sources,
              createdAt: new Date(),
            },
          ]);
          added = true;
        }
        setMessageAppeared(true);
      }

      if (data.type === 'message' || data.type === 'response') {
        console.log('Received:', data.type, 'Video:', data.data.includes('<video'));
        responseGenerated = true;
        
        // Add assistant message when response starts generating
        if (!added) {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              content: data.data,
              messageId: data.messageId,
              chatId: chatId!,
              role: 'assistant',
              sources: sources,
              createdAt: new Date(),
            },
          ]);
          added = true;
        } else {
          // Prevent duplicate content with chunk tracking
          let newText = data.data;
          if (newText && newText.trim().length > 0) {
            // Create a more robust unique identifier for this chunk
            const chunkId = newText.trim();
            
            // Skip if we've already processed this exact chunk
            if (processedChunks.has(chunkId) || chunkId.length === 0) {
              return;
            }
            processedChunks.add(chunkId);
            
            // Fix common word boundary issues and preserve formatting
            newText = newText.replace(/([a-z])([A-Z])/g, '$1 $2');
            // Preserve line breaks and formatting
            newText = newText.replace(/\\n/g, '\n');
            
            setMessages((prev) => {
              return prev.map((msg) => {
                if (msg.messageId === data.messageId && msg.role === 'assistant') {
                  const updatedContent = msg.content + newText;
                  const cleanContent = updatedContent.replace(/\s+/g, ' ');
                  return { ...msg, content: cleanContent, isStreaming: true };
                }
                return msg;
              });
            });
          }
        }
        // Only add to received message if it's not already included
        if (data.data && !recievedMessage.includes(data.data)) {
          recievedMessage += data.data;
        }
        setMessageAppeared(true);
      }

      if (data.type === 'messageEnd') {
        setChatHistory((prevHistory) => [
          ...prevHistory,
          ['human', message],
          ['assistant', recievedMessage],
        ]);

        setLoading(false);

        const lastMsg = messagesRef.current[messagesRef.current.length - 1];

        const autoImageSearch = localStorage.getItem('autoImageSearch');
        const autoVideoSearch = localStorage.getItem('autoVideoSearch');

        // Don't auto-search images/videos for generation modes
        if (lastMsg && focusMode !== 'imageGeneration' && focusMode !== 'videoGeneration' && focusMode !== 'audioGeneration') {
          if (autoImageSearch === 'true') {
            document
              .getElementById(`search-images-${lastMsg.messageId}`)
              ?.click();
          }

          if (autoVideoSearch === 'true') {
            document
              .getElementById(`search-videos-${lastMsg.messageId}`)
              ?.click();
          }
        }

        if (
          lastMsg &&
          lastMsg.role === 'assistant' &&
          lastMsg.sources &&
          lastMsg.sources.length > 0 &&
          !lastMsg.suggestions
        ) {
          const suggestions = await getSuggestions(messagesRef.current);
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.messageId === lastMsg.messageId) {
                return { ...msg, suggestions: suggestions };
              }
              return msg;
            }),
          );
        }
      }
    };

    let res;
    try {
      // Use tooling API for enhanced search when useTooling is true
      if (useTooling && focusMode === 'webSearch') {
        res = await fetch(`/api/tooling-generation?chatId=${chatId}&messageId=${messageId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: message }],
            tools: ['search'],
            stream: true,
            max_output_tokens: 1024,
            temperature: 0.7,
            chatId: chatId,
            messageId: messageId,
          }),
        });
      } else if (useTooling && (focusMode === 'imageGeneration' || focusMode === 'imageGen')) {
        res = await fetch(`/api/tooling-generation?chatId=${chatId}&messageId=${messageId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: message }],
            tools: ['generate_image'],
            stream: true,
            max_output_tokens: 1024,
            temperature: 1,
            chatId: chatId,
            messageId: messageId,
          }),
        });
      } else {
        res = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: message,
            message: {
              messageId: messageId,
              chatId: chatId!,
              content: message,
            },
            chatId: chatId!,
            files: fileIds,
            focusMode: isGenerationMode ? (focusMode === 'videoGeneration' ? 'videoGeneration' : focusMode === 'audioGeneration' ? 'audioGeneration' : 'imageGeneration') : focusMode,
            optimizationMode: optimizationMode,
            history: chatHistory,
            chatModel: {
              name: chatModelProvider.name,
              provider: chatModelProvider.provider,
            },
            embeddingModel: {
              name: embeddingModelProvider.name,
              provider: embeddingModelProvider.provider,
            },
            systemInstructions: localStorage.getItem('systemInstructions'),
          }),
        });
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to send message. Please check your connection.');
      setLoading(false);
      return;
    }

    if (!res.body) throw new Error('No response body');

    const reader = res.body?.getReader();
    const decoder = new TextDecoder('utf-8');

    let partialChunk = '';
    let fullResponse = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      partialChunk += decoder.decode(value, { stream: true });

      if (useTooling && (focusMode === 'webSearch' || focusMode === 'imageGeneration' || focusMode === 'imageGen')) {
        // Handle tooling API response format
        const lines = partialChunk.split('\n').filter(line => line.trim());
        
        let streamEnded = false;
        
        for (const line of lines) {
          if (line === '[DONE]' || streamEnded) {
            if (!streamEnded) {
              messageHandler({
                type: 'messageEnd',
                messageId: messageId
              });
              streamEnded = true;
            }
            break;
          }
          
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
              const text = jsonData.output_text_delta.text;
              // Filter artifacts and duplicates
              if (!text.includes('[Generating response...]') && 
                  !text.includes('<tool>') && 
                  !text.includes('</tool>') &&
                  !text.includes('{"query":') &&
                  !text.includes('"num_results"') &&
                  !text.includes('arch{') &&
                  !text.includes('Hello! How can I assist you') &&
                  !fullResponse.includes(text) &&
                  text.trim().length > 0) {
                fullResponse += text;
                messageHandler({
                  type: 'message',
                  data: text,
                  messageId: messageId
                });
              }
            } else if (jsonData.status === 'completed' || jsonData.finish_reason) {
              // Complete streaming and apply final formatting
              setMessages((prev) => 
                prev.map((msg) => {
                  if (msg.messageId === messageId && msg.role === 'assistant') {
                    return { ...msg, content: msg.content, isStreaming: false };
                  }
                  return msg;
                })
              );
              messageHandler({
                type: 'messageEnd',
                messageId: messageId
              });
              streamEnded = true;
              break;
            }
            
            // Handle artifacts for image generation
            if (jsonData.artifacts && Object.keys(jsonData.artifacts).length > 0) {
              messageHandler({
                type: 'messageEnd',
                messageId: messageId
              });
              streamEnded = true;
              break;
            }
          } catch (e) {
            // Skip parsing errors
          }
        }
        
        if (streamEnded) {
          break;
        }
        partialChunk = '';
      } else {
        // Handle regular chat API response format
        try {
          const messages = partialChunk.split('\n');
          for (const msg of messages) {
            if (!msg.trim()) continue;
            const json = JSON.parse(msg);
            messageHandler(json);
          }
          partialChunk = '';
        } catch (error) {
          // Keep partial chunk for next iteration
        }
      }
    }
    
    // Force end loading for tooling responses
    if (useTooling && (focusMode === 'webSearch' || focusMode === 'imageGeneration' || focusMode === 'imageGen')) {
      messageHandler({
        type: 'messageEnd',
        messageId: messageId
      });
    }
  };

  const rewrite = (messageId: string) => {
    const index = messages.findIndex((msg) => msg.messageId === messageId);

    if (index === -1) return;

    const message = messages[index - 1];

    setMessages((prev) => {
      return [...prev.slice(0, messages.length > 2 ? index - 1 : 0)];
    });
    setChatHistory((prev) => {
      return [...prev.slice(0, messages.length > 2 ? index - 1 : 0)];
    });

    sendMessage(message.content, undefined, focusMode === 'webSearch' || focusMode === 'imageGeneration' || focusMode === 'imageGen', message.messageId);
  };

  useEffect(() => {
    if (isReady && initialMessage && isConfigReady) {
      sendMessage(initialMessage, false, focusMode === 'webSearch' || focusMode === 'imageGen');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfigReady, isReady, initialMessage, focusMode]);

  if (hasError) {
    return (
      <div className="relative">
        <div className="absolute w-full flex flex-row items-center justify-end mr-5 mt-5">
          <Link href="/settings">
            <Settings className="cursor-pointer lg:hidden" />
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="dark:text-white/70 text-black/70 text-sm">
            Failed to connect to the server. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return isReady ? (
    notFound ? (
      <NextError statusCode={404} />
    ) : (
      <div>
        {messages.length > 0 ? (
          <>
            {/* <Navbar chatId={chatId!} messages={messages} /> */}
            <Chat
              loading={loading}
              messages={messages}
              sendMessage={sendMessage}
              messageAppeared={messageAppeared}
              rewrite={rewrite}
              fileIds={fileIds}
              setFileIds={setFileIds}
              files={files}
              setFiles={setFiles}
              focusMode={focusMode}
              setFocusMode={setFocusMode}
            />
          </>
        ) : (
          <EmptyChat
            sendMessage={sendMessage}
            focusMode={focusMode}
            setFocusMode={setFocusMode}
            optimizationMode={optimizationMode}
            setOptimizationMode={setOptimizationMode}
            fileIds={fileIds}
            setFileIds={setFileIds}
            files={files}
            setFiles={setFiles}
          />
        )}
      </div>
    )
  ) : (
    <div className="flex flex-row items-center justify-center min-h-screen">
      <svg
        aria-hidden="true"
        className="w-8 h-8 text-light-200 fill-light-secondary dark:text-[#202020] animate-spin dark:fill-[#ffffff3b]"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100.003 78.2051 78.1951 100.003 50.5908 100C22.9765 99.9972 0.997224 78.018 1 50.4037C1.00281 22.7993 22.8108 0.997224 50.4251 1C78.0395 1.00281 100.018 22.8108 100 50.4251ZM9.08164 50.594C9.06312 73.3997 27.7909 92.1272 50.5966 92.1457C73.4023 92.1642 92.1298 73.4365 92.1483 50.6308C92.1669 27.8251 73.4392 9.0973 50.6335 9.07878C27.8278 9.06026 9.10003 27.787 9.08164 50.594Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4037 97.8624 35.9116 96.9801 33.5533C95.1945 28.8227 92.871 24.3692 90.0681 20.348C85.6237 14.1775 79.4473 9.36872 72.0454 6.45794C64.6435 3.54717 56.3134 2.65431 48.3133 3.89319C45.869 4.27179 44.3768 6.77534 45.014 9.20079C45.6512 11.6262 48.1343 13.0956 50.5786 12.717C56.5073 11.8281 62.5542 12.5399 68.0406 14.7911C73.527 17.0422 78.2187 20.7487 81.5841 25.4923C83.7976 28.5886 85.4467 32.059 86.4416 35.7474C87.1273 38.1189 89.5423 39.6781 91.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
    </div>
  );
};

export default ChatWindow;
