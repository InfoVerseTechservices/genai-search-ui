// components/ChatWindow.tsx
'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Document } from '@langchain/core/documents';
import Navbar from './Navbar';
import Chat from './Chat';
import EmptyChat from './EmptyChat';
import crypto from 'crypto';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { getSuggestions } from '@/lib/actions';
import Error from 'next/error';
import { getCookie } from '@/components/LeftSidebar/cookies';
import { useUserProfile } from '@/app/context/user';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { NewGenSearchIcon, HistoryIcon } from './Icons';

// Import the image generation function
import { generateImage } from '@/lib/imageActions';
// Assuming ImageGenParams is defined in EmptyChatMessageInput or a shared types file
// If not, define it here or import appropriately. For this subtask, we assume it's available.
// For example, if it were moved to a types file:
// import { ImageGenParams } from '@/lib/types';

// Local definition for subtask clarity if not imported
interface ImageGenParams {
  prompt: string;
  negative_prompt?: string;
  model?: string;
  size?: string;
  guidance_scale?: number;
}


// Message type (already updated in previous step)
export type Message = {
  messageId: string;
  chatId: string;
  createdAt: Date;
  content: string;
  role: 'user' | 'assistant';
  suggestions?: string[];
  sources?: Document[];
  type?: 'text' | 'image_prompt' | 'generated_image';
  imagePromptText?: string;
  b64Json?: string;
  status?: 'loading' | 'completed' | 'error';
};

// ... (useSocket, loadMessages functions remain largely the same)
// Ensure useSocket and loadMessages are present from the existing file content.

const useSocket = (
  url: string,
  setIsWSReady: (ready: boolean) => void,
  setError: (error: boolean) => void,
) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const heartbeatInterval = 30000; // 30 seconds
  let heartbeatTimeoutId: any;

  useEffect(() => {
    if (!ws) {
      const connectWs = async () => {
        let chatModel = localStorage.getItem('chatModel');
        let chatModelProvider = localStorage.getItem('chatModelProvider');
        let embeddingModel = localStorage.getItem('embeddingModel');
        let embeddingModelProvider = localStorage.getItem(
          'embeddingModelProvider',
        );

        const providers = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/models`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: getCookie('token'),
            },
          },
        ).then(async (res) => await res.json());

        if (
          !chatModel ||
          !chatModelProvider ||
          !embeddingModel ||
          !embeddingModelProvider
        ) {
          if (!chatModel || !chatModelProvider) {
            const chatModelProviders = providers.chatModelProviders;

            chatModelProvider = Object.keys(chatModelProviders)[0];

            if (chatModelProvider === 'custom_openai') {
              toast.error(
                'Seems like you are using the custom OpenAI provider, please open the settings and configure the API key and base URL',
              );
              setError(true);
              return;
            } else {
              chatModel = Object.keys(chatModelProviders[chatModelProvider])[0];
              if (
                !chatModelProviders ||
                Object.keys(chatModelProviders).length === 0
              )
                return toast.error('No chat models available');
            }
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
          localStorage.setItem('chatModelProvider', chatModelProvider!);
          localStorage.setItem('embeddingModel', embeddingModel!);
          localStorage.setItem(
            'embeddingModelProvider',
            embeddingModelProvider!,
          );
        } else {
          const chatModelProviders = providers.chatModelProviders;
          const embeddingModelProviders = providers.embeddingModelProviders;

          if (
            Object.keys(chatModelProviders).length > 0 &&
            chatModelProvider && // Check if chatModelProvider is not null
            !chatModelProviders[chatModelProvider]
          ) {
            chatModelProvider = Object.keys(chatModelProviders)[0];
            localStorage.setItem('chatModelProvider', chatModelProvider);
          }

          if (
            chatModelProvider &&
            chatModel && // Check if chatModel is not null
            chatModelProvider != 'custom_openai' &&
            !chatModelProviders[chatModelProvider][chatModel]
          ) {
            chatModel = Object.keys(chatModelProviders[chatModelProvider])[0];
            localStorage.setItem('chatModel', chatModel);
          }

          if (
            Object.keys(embeddingModelProviders).length > 0 &&
            embeddingModelProvider && // Check if embeddingModelProvider is not null
            !embeddingModelProviders[embeddingModelProvider]
          ) {
            embeddingModelProvider = Object.keys(embeddingModelProviders)[0];
            localStorage.setItem(
              'embeddingModelProvider',
              embeddingModelProvider,
            );
          }

          if (
            embeddingModelProvider &&
            embeddingModel && // Check if embeddingModel is not null
            !embeddingModelProviders[embeddingModelProvider][embeddingModel]
          ) {
            embeddingModel = Object.keys(
              embeddingModelProviders[embeddingModelProvider],
            )[0];
            localStorage.setItem('embeddingModel', embeddingModel);
          }
        }

        const wsURL = new URL(url);
        const searchParams = new URLSearchParams({});

        searchParams.append('chatModel', chatModel!);
        searchParams.append('chatModelProvider', chatModelProvider!);

        if (chatModelProvider === 'custom_openai') {
          searchParams.append(
            'openAIApiKey',
            localStorage.getItem('openAIApiKey')!,
          );
          searchParams.append(
            'openAIBaseURL',
            localStorage.getItem('openAIBaseURL')!,
          );
        }

        searchParams.append('embeddingModel', embeddingModel!);
        searchParams.append('embeddingModelProvider', embeddingModelProvider!);
        searchParams.append('token', getCookie('token')!);

        wsURL.search = searchParams.toString();

        const wsInstance = new WebSocket(wsURL.toString()); // Renamed to wsInstance

        const timeoutId = setTimeout(() => {
          if (wsInstance.readyState !== 1) { // Use wsInstance
            toast.error(
              'Failed to connect to the server. Please try again later.',
            );
          }
        }, 10000);

        wsInstance.onopen = () => { // Use wsInstance
          console.log('[DEBUG] open');
          clearTimeout(timeoutId);
          setIsWSReady(true);
          startHeartbeat(wsInstance); // Use wsInstance
        };

        wsInstance.onerror = () => { // Use wsInstance
          clearTimeout(timeoutId);
          setError(true);
          toast.error('WebSocket connection error.');
        };

        wsInstance.onclose = () => { // Use wsInstance
          clearTimeout(timeoutId);
          // setError(true);
          console.log('[DEBUG] closed');
          stopHeartbeat();
        };

        wsInstance.addEventListener('message', (e) => { // Use wsInstance
          const data = JSON.parse(e.data);
          if (data.type === 'pong') {
            clearTimeout(heartbeatTimeoutId); // Server responded with pong
          } else if (data.type === 'error') {
            toast.error(data.data);
          }
        });

        setWs(wsInstance); // Use wsInstance
      };

      const startHeartbeat = (socket: WebSocket) => {
        const sendPing = () => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'ping' }));
            console.log('Ping sent');
            heartbeatTimeoutId = setTimeout(() => {
              console.error('No pong received, closing WebSocket.');
              socket.close();
            }, heartbeatInterval - 7000);
          }
        };

        sendPing();
        const heartbeatIntervalId = setInterval(sendPing, heartbeatInterval);

        // Clean up interval on component unmount or socket change
        return () => clearInterval(heartbeatIntervalId);
      };

      const stopHeartbeat = () => {
        clearTimeout(heartbeatTimeoutId);
      };

      connectWs();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ws, url, setIsWSReady, setError]); // Removed heartbeatTimeoutId, heartbeatInterval from dependencies

  return ws;
};

const loadMessages = async (
  chatId: string,
  setMessages: (messages: Message[]) => void,
  setIsMessagesLoaded: (loaded: boolean) => void,
  setChatHistory: (history: [string, string][]) => void,
  setFocusMode: (mode: string) => void,
  setNotFound: (notFound: boolean) => void,
) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/chats/${chatId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getCookie('token')!,
      },
    },
  );

  if (res.status === 404) {
    setNotFound(true);
    setIsMessagesLoaded(true);
    return;
  }

  const data = await res.json();

  const messages = data.messages.map((msg: any) => {
    const metadata = JSON.parse(msg.metadata || '{}'); // Ensure metadata is an object
    return {
      ...msg,
      ...metadata,
      type: msg.type || metadata?.type || 'text',
      imagePromptText: msg.imagePromptText || metadata?.imagePromptText,
      b64Json: msg.b64Json || metadata?.b64Json,
      status: msg.status || metadata?.status,
    };
  }) as Message[];

  setMessages(messages);

  const history = messages
    .filter(msg => msg.type === 'text' || !msg.type)
    .map((msg) => [msg.role, msg.content] as [string, string]);

  console.log('[DEBUG] messages loaded');

  if (messages.length > 0 && messages[0].content) {
    document.title = messages[0].content;
  }

  setChatHistory(history);
  setFocusMode(data.chat.focusMode);
  setIsMessagesLoaded(true);
};


const ChatWindow = ({ id }: { id?: string }) => {
  const { userDetails, isLoggedIn } = useUserProfile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMessage = searchParams.get('q');

  const [chatId, setChatId] = useState<string | undefined>(id);
  const [newChatCreated, setNewChatCreated] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isWSReady, setIsWSReady] = useState(false);
  const ws = useSocket(process.env.NEXT_PUBLIC_WS_URL!, setIsWSReady, setHasError);
  const [loading, setLoading] = useState(false); // For text generation
  const [messageAppeared, setMessageAppeared] = useState(false);
  const [chatHistory, setChatHistory] = useState<[string, string][]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [focusMode, setFocusMode] = useState('webSearch');
  const [isMessagesLoaded, setIsMessagesLoaded] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/sign-in');
      return;
    }
    if (chatId && !newChatCreated && !isMessagesLoaded && messages.length === 0) {
      loadMessages(chatId, setMessages, setIsMessagesLoaded, setChatHistory, setFocusMode, setNotFound);
    } else if (!chatId) {
      setNewChatCreated(true);
      setIsMessagesLoaded(true);
      const newChatId = crypto.randomBytes(20).toString('hex');
      setChatId(newChatId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, router, chatId, newChatCreated, isMessagesLoaded, messages.length]);

  const closeWebSocket = useCallback(() => {
    if (ws?.readyState === 1) {
      ws.close();
      console.log('[DEBUG] closed websocket');
    }
  }, [ws]);

  useEffect(() => {
    return closeWebSocket;
  }, [closeWebSocket]);

  const messagesRef = useRef<Message[]>([]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  useEffect(() => {
    if (isMessagesLoaded && isWSReady) {
      setIsReady(true);
    }
  }, [isMessagesLoaded, isWSReady]);

  const sendMessage = async (messageContent: string, file: File | null = null) => {
    if (loading) return;
    setLoading(true);
    setMessageAppeared(false);

    let sources: Document[] | undefined = undefined;
    let recievedMessage = '';
    let added = false;
    const userMessageId = crypto.randomBytes(7).toString('hex');

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        content: messageContent,
        messageId: userMessageId,
        chatId: chatId!,
        role: 'user',
        createdAt: new Date(),
        type: 'text',
      },
    ]);

    if (file) {
      console.log("File upload initiated with message:", messageContent, file.name);
      // setLoading(false); // Reset loading if file handling is separate.
      // This part needs more specific logic if file upload is to interact with WS or be handled client-side
    }

    ws?.send(
      JSON.stringify({
        type: 'message',
        message: { chatId: chatId!, content: messageContent },
        focusMode: focusMode,
        history: [...chatHistory, ['human', messageContent]],
      }),
    );

    const messageHandler = async (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      if (data.type === 'error') {
        toast.error(data.data);
        setLoading(false); return;
      }
      if (data.type === 'sources') {
        sources = data.data;
        if (!added) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { content: '', messageId: data.messageId, chatId: chatId!, role: 'assistant', sources: sources, createdAt: new Date(), type: 'text' },
          ]);
          added = true;
        }
        setMessageAppeared(true);
      }
      if (data.type === 'message') {
        if (!added) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { content: data.data, messageId: data.messageId, chatId: chatId!, role: 'assistant', sources: sources, createdAt: new Date(), type: 'text' },
          ]);
          added = true;
        }
        setMessages((prev) => prev.map((m) => m.messageId === data.messageId ? { ...m, content: m.content + data.data } : m));
        recievedMessage += data.data;
        setMessageAppeared(true);
      }
      if (data.type === 'messageEnd') {
        setChatHistory((prevHistory) => [...prevHistory, ['human', messageContent], ['assistant', recievedMessage]]);
        ws?.removeEventListener('message', messageHandler);
        setLoading(false);
        const lastMsg = messagesRef.current[messagesRef.current.length - 1];
        if (lastMsg?.role === 'assistant' && lastMsg?.sources && lastMsg?.sources.length > 0 && !lastMsg?.suggestions) {
          const suggestions = await getSuggestions(messagesRef.current.filter(m => m.type === 'text' || !m.type));
          setMessages((prev) => prev.map((msg) => msg.messageId === lastMsg.messageId ? { ...msg, suggestions: suggestions } : msg));
        }
      }
    };
    ws?.addEventListener('message', messageHandler);
  };

  const handleImageGenerationRequest = async (params: ImageGenParams, imagePromptText: string) => {
    if (!chatId) {
      toast.error("Chat ID is not available.");
      return;
    }
    setLoading(true);

    const userPromptMessageId = crypto.randomBytes(7).toString('hex');
    const assistantImageMessageId = crypto.randomBytes(7).toString('hex');

    const userImagePromptMessage: Message = {
      messageId: userPromptMessageId,
      chatId: chatId,
      createdAt: new Date(),
      content: `Generating image for: "${imagePromptText}"`,
      role: 'user',
      type: 'image_prompt',
      imagePromptText: imagePromptText,
      status: 'loading',
    };
    setMessages((prevMessages) => [...prevMessages, userImagePromptMessage]);

    try {
      const result = await generateImage(params);

      if (result.data && result.data.length > 0 && result.data[0].b64_json) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.messageId === userPromptMessageId ? { ...msg, status: 'completed', content: `Image prompt: "${imagePromptText}"` } : msg
          )
        );

        const assistantImageMessage: Message = {
          messageId: assistantImageMessageId,
          chatId: chatId,
          createdAt: new Date(),
          content: '',
          role: 'assistant',
          type: 'generated_image',
          b64Json: result.data[0].b64_json,
          imagePromptText: imagePromptText,
        };
        setMessages((prevMessages) => [...prevMessages, assistantImageMessage]);
        toast.success('Image generated successfully!');
      } else {
        throw new Error(result.error || 'Image generation failed: No image data returned.');
      }
    } catch (error: any) {
      console.error("Image generation error:", error);
      toast.error(`Image generation failed: ${error.message || 'Unknown error'}`);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.messageId === userPromptMessageId
            ? { ...msg, status: 'error', content: `Failed to generate image for: "${imagePromptText}". Error: ${error.message}` }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const rewrite = (messageId: string) => {
    const index = messages.findIndex((msg) => msg.messageId === messageId);
    if (index === -1 || index === 0 || messages[index-1]?.type !== 'text') return;
    const messageToRewrite = messages[index - 1];
    if (messageToRewrite.role !== 'user' || (messageToRewrite.type && messageToRewrite.type !== 'text')) return;

    setMessages((prev) => [...prev.slice(0, index - 1)]);
    // Adjust chatHistory: find the corresponding entry and slice from there.
    // This is a simplified history adjustment. A more robust way might involve IDs in history.
    let historyPairsToRemove = 0;
    for (let i = prev.length -1; i >= index -1; i--) {
        if (prev[i].type === 'text' || !prev[i].type) historyPairsToRemove++;
    }

    setChatHistory((prevHist) => [...prevHist.slice(0, prevHist.length - historyPairsToRemove )]);
    sendMessage(messageToRewrite.content);
  };

  useEffect(() => {
    if (isReady && initialMessage && !messages.some(m => m.content === initialMessage && m.role === 'user')) {
      sendMessage(initialMessage);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, initialMessage]);

  const editMessage = (messageId: string, newContent: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.messageId === messageId ? { ...msg, content: newContent } : msg,
      ),
    );
  };

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-black/70 text-sm">
          Failed to connect to the server. Please try again later.
        </p>
      </div>
    );
  }

  return isReady ? (
    notFound ? ( <Error statusCode={404} /> ) : (
      <div className="">
        <div className="absolute top-3 right-2 z-[999]">
          <div className="flex space-x-4 mt-3">
            <button onClick={(e) => { setMessages([]); setChatId(crypto.randomBytes(20).toString('hex')); setNewChatCreated(true); setChatHistory([]); }}>
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 mb-1"> <NewGenSearchIcon w={24} h={24} fill={'#8E8E93'} /> </div>
              </div>
            </button>
            <Link href="/library/">
              <div className="flex flex-col items-center">
                <div className="w-8 sm:w-6 h-6 mb-1"> <HistoryIcon w={24} h={24} fill={'#8E8E93'} /> </div>
              </div>
            </Link>
          </div>
        </div>
        {messages.length > 0 ? (
          <>
            <Navbar messages={messages} />
            <Chat
              loading={loading}
              messages={messages}
              sendMessage={sendMessage}
              onImagePromptSubmit={handleImageGenerationRequest}
              messageAppeared={messageAppeared}
              rewrite={rewrite}
              editMessage={editMessage}
              setMessages={setMessages}
            />
          </>
        ) : (
          <>
            <EmptyChat
              sendMessage={sendMessage}
              onImagePromptSubmit={handleImageGenerationRequest}
              focusMode={focusMode}
              setFocusMode={setFocusMode}
            />
          </>
        )}
      </div>
    )
  ) : (
    <div className="flex flex-row items-center justify-center min-h-screen">
      <svg aria-hidden="true" className="w-8 h-8 text-light-200 fill-light-secondary dark:text-[#202020] animate-spin dark:fill-[#ffffff3b]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg" >
        <path d="M100 50.5908C100.003 78.2051 78.1951 100.003 50.5908 100C22.9765 99.9972 0.997224 78.018 1 50.4037C1.00281 22.7993 22.8108 0.997224 50.4251 1C78.0395 1.00281 100.018 22.8108 100 50.4251ZM9.08164 50.594C9.06312 73.3997 27.7909 92.1272 50.5966 92.1457C73.4023 92.1642 92.1298 73.4365 92.1483 50.6308C92.1669 27.8251 73.4392 9.0973 50.6335 9.07878C27.8278 9.06026 9.10003 27.787 9.08164 50.594Z" fill="currentColor" />
        <path d="M93.9676 39.0409C96.393 38.4037 97.8624 35.9116 96.9801 33.5533C95.1945 28.8227 92.871 24.3692 90.0681 20.348C85.6237 14.1775 79.4473 9.36872 72.0454 6.45794C64.6435 3.54717 56.3134 2.65431 48.3133 3.89319C45.869 4.27179 44.3768 6.77534 45.014 9.20079C45.6512 11.6262 48.1343 13.0956 50.5786 12.717C56.5073 11.8281 62.5542 12.5399 68.0406 14.7911C73.527 17.0422 78.2187 20.7487 81.5841 25.4923C83.7976 28.5886 85.4467 32.059 86.4416 35.7474C87.1273 38.1189 89.5423 39.6781 91.9676 39.0409Z" fill="currentFill" />
      </svg>
    </div>
  );
};

export default ChatWindow;
