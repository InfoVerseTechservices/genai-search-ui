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

import { generateImage } from '@/lib/imageActions';
import { generateAudio } from '@/lib/audioActions'; // Import new audio action

// Define ImageGenParams (from previous subtasks or shared types)
interface ImageGenParams {
  prompt: string;
  negative_prompt?: string;
  model?: string;
  size?: string;
  guidance_scale?: number;
}

// Define AudioGenParams (from lib/audioActions.ts or shared types)
export interface AudioGenParams {
  prompt: string;
  negative_prompt?: string;
  duration_seconds?: number;
  seed?: number;
  model?: string;
}

export type Message = {
  messageId: string;
  chatId: string;
  createdAt: Date;
  content: string;
  role: 'user' | 'assistant';
  suggestions?: string[];
  sources?: Document[];
  type?: 'text' | 'image_prompt' | 'generated_image' | 'audio_prompt' | 'generated_audio'; // Added audio types
  imagePromptText?: string;
  audioPromptText?: string; // New: For the original audio prompt
  b64Json?: string; // For image b64 data
  b64JsonAudio?: string; // New: For audio b64 data
  status?: 'loading' | 'completed' | 'error';
};

const useSocket = (
  url: string,
  setIsWSReady: (ready: boolean) => void,
  setError: (error: boolean) => void,
) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const heartbeatInterval = 30000;
  let heartbeatTimeoutId: any;

  useEffect(() => {
    if (!ws) {
      const connectWs = async () => {
        let chatModel = localStorage.getItem('chatModel');
        let chatModelProvider = localStorage.getItem('chatModelProvider');
        let embeddingModel = localStorage.getItem('embeddingModel');
        let embeddingModelProvider = localStorage.getItem('embeddingModelProvider');

        const providersRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/models`,
          { headers: { 'Content-Type': 'application/json', Authorization: getCookie('token')! } }
        );

        if (!providersRes.ok) {
            toast.error("Failed to fetch model providers.");
            setError(true);
            return;
        }
        const providers = await providersRes.json();


        if (!chatModel || !chatModelProvider || !embeddingModel || !embeddingModelProvider) {
          if (!chatModel || !chatModelProvider) {
            const chatModelProviders = providers.chatModelProviders;
            if (!chatModelProviders || Object.keys(chatModelProviders).length === 0) {
                toast.error('No chat models available');
                setError(true); return;
            }
            chatModelProvider = Object.keys(chatModelProviders)[0];
            if (chatModelProvider === 'custom_openai') {
              toast.error('Custom OpenAI provider selected, please configure API key and base URL in settings.');
              setError(true); return;
            }
            chatModel = Object.keys(chatModelProviders[chatModelProvider])[0];
          }

          if (!embeddingModel || !embeddingModelProvider) {
            const embeddingModelProviders = providers.embeddingModelProviders;
             if (!embeddingModelProviders || Object.keys(embeddingModelProviders).length === 0) {
                toast.error('No embedding models available');
                 setError(true); return;
             }
            embeddingModelProvider = Object.keys(embeddingModelProviders)[0];
            embeddingModel = Object.keys(embeddingModelProviders[embeddingModelProvider])[0];
          }

          localStorage.setItem('chatModel', chatModel!);
          localStorage.setItem('chatModelProvider', chatModelProvider!);
          localStorage.setItem('embeddingModel', embeddingModel!);
          localStorage.setItem('embeddingModelProvider', embeddingModelProvider!);
        } else {
          // Validate existing settings
          const { chatModelProviders, embeddingModelProviders } = providers;
          if (chatModelProvider && !chatModelProviders[chatModelProvider]) {
            chatModelProvider = Object.keys(chatModelProviders)[0];
            localStorage.setItem('chatModelProvider', chatModelProvider!);
            chatModel = Object.keys(chatModelProviders[chatModelProvider!])[0];
            localStorage.setItem('chatModel', chatModel!);
          }
          if (embeddingModelProvider && !embeddingModelProviders[embeddingModelProvider]) {
            embeddingModelProvider = Object.keys(embeddingModelProviders)[0];
            localStorage.setItem('embeddingModelProvider', embeddingModelProvider!);
            embeddingModel = Object.keys(embeddingModelProviders[embeddingModelProvider!])[0];
            localStorage.setItem('embeddingModel', embeddingModel!);
          }
        }

        const wsURL = new URL(url);
        const searchParams = new URLSearchParams({});
        searchParams.append('chatModel', chatModel!);
        searchParams.append('chatModelProvider', chatModelProvider!);
        if (chatModelProvider === 'custom_openai') {
          searchParams.append('openAIApiKey', localStorage.getItem('openAIApiKey')!);
          searchParams.append('openAIBaseURL', localStorage.getItem('openAIBaseURL')!);
        }
        searchParams.append('embeddingModel', embeddingModel!);
        searchParams.append('embeddingModelProvider', embeddingModelProvider!);
        searchParams.append('token', getCookie('token')!);
        wsURL.search = searchParams.toString();

        const wsInstance = new WebSocket(wsURL.toString());
        const timeoutId = setTimeout(() => { if (wsInstance.readyState !== 1) toast.error('Connection timeout.'); }, 10000);
        wsInstance.onopen = () => { clearTimeout(timeoutId); setIsWSReady(true); startHeartbeat(wsInstance); };
        wsInstance.onerror = () => { clearTimeout(timeoutId); setError(true); toast.error('WebSocket error.'); };
        wsInstance.onclose = () => { clearTimeout(timeoutId); stopHeartbeat(); };
        wsInstance.addEventListener('message', (e) => {
          const data = JSON.parse(e.data);
          if (data.type === 'pong') clearTimeout(heartbeatTimeoutId);
          else if (data.type === 'error') toast.error(data.data);
        });
        setWs(wsInstance);
      };

      const startHeartbeat = (socket: WebSocket) => {
        const sendPing = () => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'ping' }));
            heartbeatTimeoutId = setTimeout(() => socket.close(), heartbeatInterval - 7000);
          }
        };
        sendPing(); // Initial ping
        const intervalId = setInterval(sendPing, heartbeatInterval);
        (socket as any).heartbeatIntervalId = intervalId; // Store to clear later
      };

      const stopHeartbeat = () => {
        clearTimeout(heartbeatTimeoutId);
        if (ws && (ws as any).heartbeatIntervalId) {
            clearInterval((ws as any).heartbeatIntervalId);
        }
      };
      connectWs();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ws, url, setIsWSReady, setError]);
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
    { headers: { 'Content-Type': 'application/json', Authorization: getCookie('token')! } }
  );
  if (res.status === 404) { setNotFound(true); setIsMessagesLoaded(true); return; }
  if (!res.ok) { toast.error("Failed to load messages."); setIsMessagesLoaded(true); return; } // Added error handling

  const data = await res.json();
  const messages = data.messages.map((msg: any) => {
    const metadata = JSON.parse(msg.metadata || '{}');
    return {
      ...msg, ...metadata,
      type: msg.type || metadata?.type || 'text',
      imagePromptText: msg.imagePromptText || metadata?.imagePromptText,
      audioPromptText: msg.audioPromptText || metadata?.audioPromptText, // Added
      b64Json: msg.b64Json || metadata?.b64Json,
      b64JsonAudio: msg.b64JsonAudio || metadata?.b64JsonAudio, // Added
      status: msg.status || metadata?.status,
    };
  }) as Message[];

  setMessages(messages);
  const history = messages
    .filter(msg => msg.type === 'text' || !msg.type)
    .map((msg) => [msg.role, msg.content] as [string, string]);

  if (messages.length > 0 && messages[0].content) document.title = messages[0].content;
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
  const [loading, setLoading] = useState(false);
  const [messageAppeared, setMessageAppeared] = useState(false);
  const [chatHistory, setChatHistory] = useState<[string, string][]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [focusMode, setFocusMode] = useState('webSearch');
  const [isMessagesLoaded, setIsMessagesLoaded] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) { router.push('/sign-in'); return; }
    if (chatId && !newChatCreated && !isMessagesLoaded && messages.length === 0) {
      loadMessages(chatId, setMessages, setIsMessagesLoaded, setChatHistory, setFocusMode, setNotFound);
    } else if (!chatId) {
      setNewChatCreated(true); setIsMessagesLoaded(true);
      const newChatId = crypto.randomBytes(20).toString('hex');
      setChatId(newChatId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, router, chatId, newChatCreated, isMessagesLoaded, messages.length]);

  const closeWebSocket = useCallback(() => {
    if (ws?.readyState === 1) { ws.close(); console.log('[DEBUG] closed websocket'); }
  }, [ws]);
  useEffect(() => { return closeWebSocket; }, [closeWebSocket]);

  const messagesRef = useRef<Message[]>([]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  useEffect(() => { if (isMessagesLoaded && isWSReady) setIsReady(true); }, [isMessagesLoaded, isWSReady]);

  const sendMessage = async (messageContent: string, file: File | null = null) => {
    if (loading) return; setLoading(true); setMessageAppeared(false);
    let sources: Document[] | undefined = undefined;
    let recievedMessage = ''; let added = false;
    const userMessageId = crypto.randomBytes(7).toString('hex');

    setMessages((prev) => [...prev, { content: messageContent, messageId: userMessageId, chatId: chatId!, role: 'user', createdAt: new Date(), type: 'text' }]);
    if (file) console.log("File upload initiated:", file.name); // File handling logic would go here

    ws?.send(JSON.stringify({ type: 'message', message: { chatId: chatId!, content: messageContent }, focusMode: focusMode, history: [...chatHistory, ['human', messageContent]] }));

    const messageHandler = async (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      if (data.type === 'error') { toast.error(data.data); setLoading(false); return; }
      if (data.type === 'sources') {
        sources = data.data;
        if (!added) { setMessages((prev) => [...prev, { content: '', messageId: data.messageId, chatId: chatId!, role: 'assistant', sources: sources, createdAt: new Date(), type: 'text' }]); added = true; }
        setMessageAppeared(true);
      }
      if (data.type === 'message') {
        if (!added) { setMessages((prev) => [...prev, { content: data.data, messageId: data.messageId, chatId: chatId!, role: 'assistant', sources: sources, createdAt: new Date(), type: 'text' }]); added = true; }
        setMessages((prev) => prev.map((m) => m.messageId === data.messageId ? { ...m, content: m.content + data.data } : m));
        recievedMessage += data.data; setMessageAppeared(true);
      }
      if (data.type === 'messageEnd') {
        setChatHistory((prev) => [...prev, ['human', messageContent], ['assistant', recievedMessage]]);
        ws?.removeEventListener('message', messageHandler); setLoading(false);
        const lastMsg = messagesRef.current[messagesRef.current.length - 1];
        if (lastMsg?.role === 'assistant' && lastMsg?.sources?.length && !lastMsg?.suggestions) {
          const suggestions = await getSuggestions(messagesRef.current.filter(m => m.type === 'text' || !m.type));
          setMessages((prev) => prev.map((msg) => msg.messageId === lastMsg.messageId ? { ...msg, suggestions: suggestions } : msg));
        }
      }
    };
    ws?.addEventListener('message', messageHandler);
  };

  const handleImageGenerationRequest = async (params: ImageGenParams, imagePromptText: string) => {
    if (!chatId) { toast.error("Chat ID missing."); return; } setLoading(true);
    const userPromptMsgId = crypto.randomBytes(7).toString('hex');
    const assistantImgMsgId = crypto.randomBytes(7).toString('hex');
    setMessages((prev) => [...prev, { messageId: userPromptMsgId, chatId, createdAt: new Date(), content: `Generating image for: "${imagePromptText}"`, role: 'user', type: 'image_prompt', imagePromptText, status: 'loading' }]);
    try {
      const result = await generateImage(params);
      if (result.data?.[0]?.b64_json) {
        setMessages((prev) => prev.map((m) => m.messageId === userPromptMsgId ? { ...m, status: 'completed', content: `Image prompt: "${imagePromptText}"` } : m));
        setMessages((prev) => [...prev, { messageId: assistantImgMsgId, chatId, createdAt: new Date(), content: '', role: 'assistant', type: 'generated_image', b64Json: result.data[0].b64_json, imagePromptText }]);
        toast.success('Image generated!');
      } else { throw new Error(result.error || "No image data."); }
    } catch (err: any) {
      toast.error(`Image generation failed: ${err.message}`);
      setMessages((prev) => prev.map((m) => m.messageId === userPromptMsgId ? { ...m, status: 'error', content: `Failed: "${imagePromptText}". Error: ${err.message}` } : m));
    } finally { setLoading(false); }
  };

  const handleAudioGenerationRequest = async (params: AudioGenParams, audioPromptText: string) => {
    if (!chatId) { toast.error("Chat ID missing for audio generation."); return; } setLoading(true);
    const userPromptMsgId = crypto.randomBytes(7).toString('hex');
    const assistantAudioMsgId = crypto.randomBytes(7).toString('hex');
    setMessages((prev) => [...prev, { messageId: userPromptMsgId, chatId, createdAt: new Date(), content: `Generating audio for: "${audioPromptText}"`, role: 'user', type: 'audio_prompt', audioPromptText, status: 'loading' }]);
    try {
      const result = await generateAudio(params);
      if (result.data?.[0]?.b64_json) {
        setMessages((prev) => prev.map((m) => m.messageId === userPromptMsgId ? { ...m, status: 'completed', content: `Audio prompt: "${audioPromptText}"` } : m));
        setMessages((prev) => [...prev, { messageId: assistantAudioMsgId, chatId, createdAt: new Date(), content: '', role: 'assistant', type: 'generated_audio', b64JsonAudio: result.data[0].b64_json, audioPromptText }]);
        toast.success('Audio generated!');
      } else { throw new Error(result.error || "No audio data."); }
    } catch (err: any) {
      toast.error(`Audio generation failed: ${err.message}`);
      setMessages((prev) => prev.map((m) => m.messageId === userPromptMsgId ? { ...m, status: 'error', content: `Failed: "${audioPromptText}". Error: ${err.message}` } : m));
    } finally { setLoading(false); }
  };

  const rewrite = (messageId: string) => {
    const index = messages.findIndex((msg) => msg.messageId === messageId);
    if (index <= 0) return;
    const prevUserMessage = messages[index - 1];
    if (prevUserMessage?.role !== 'user' || (prevUserMessage.type && prevUserMessage.type !== 'text')) return;

    setMessages((prev) => prev.slice(0, index - 1));

    // More accurate history removal
    let textMsgsToRemove = 0;
    for (let i = index -1; i < messages.length; i++) {
        if (messages[i].type === 'text' || !messages[i].type) textMsgsToRemove++;
    }
    setChatHistory((prevHist) => prevHist.slice(0, prevHist.length - textMsgsToRemove * 2)); // Each text interaction is 2 entries (human, assistant)
    sendMessage(prevUserMessage.content);
  };

  useEffect(() => {
    if (isReady && initialMessage && !messages.some(m => m.content === initialMessage && m.role === 'user')) {
      sendMessage(initialMessage);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, initialMessage]);

  const editMessage = (messageId: string, newContent: string) => {
    setMessages((prev) => prev.map((msg) => msg.messageId === messageId ? { ...msg, content: newContent } : msg));
  };

  if (hasError) { return <div className="flex flex-col items-center justify-center min-h-screen"><p className="text-black/70 text-sm">Connection error. Try again.</p></div>; }

  return isReady ? (
    notFound ? ( <Error statusCode={404} /> ) : (
      <div className="">
        <div className="absolute top-3 right-2 z-[999]">
          <div className="flex space-x-4 mt-3">
            <button onClick={() => { setMessages([]); setChatId(crypto.randomBytes(20).toString('hex')); setNewChatCreated(true); setChatHistory([]); }}>
              <div className="flex flex-col items-center"><div className="w-6 h-6 mb-1"> <NewGenSearchIcon w={24} h={24} fill={'#8E8E93'} /> </div></div>
            </button>
            <Link href="/library/">
              <div className="flex flex-col items-center"><div className="w-8 sm:w-6 h-6 mb-1"> <HistoryIcon w={24} h={24} fill={'#8E8E93'} /> </div></div>
            </Link>
          </div>
        </div>
        {messages.length > 0 ? (
          <>
            <Navbar messages={messages} />
            <Chat
              loading={loading} messages={messages} sendMessage={sendMessage}
              onImagePromptSubmit={handleImageGenerationRequest}
              onAudioPromptSubmit={handleAudioGenerationRequest} // New
              messageAppeared={messageAppeared} rewrite={rewrite} editMessage={editMessage} setMessages={setMessages}
            />
          </>
        ) : (
          <EmptyChat
            sendMessage={sendMessage}
            onImagePromptSubmit={handleImageGenerationRequest}
            onAudioPromptSubmit={handleAudioGenerationRequest} // New
            focusMode={focusMode} setFocusMode={setFocusMode}
          />
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
