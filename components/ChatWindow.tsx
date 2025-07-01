'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Document } from '@langchain/core/documents';
import crypto from 'crypto';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Import your main components
import Chat from './Chat';
import EmptyChat from './EmptyChat';
import ChatSkeleton from './ChatSkeleton';

// Import context and helper components/functions
import { useLayout, RightSidebarContent } from '@/app/context/LayoutContext'; // Import context hook and type
import { getSuggestions } from '@/lib/actions';
import Error from 'next/error';
import { getCookie } from '@/components/LeftSidebar/cookies';
import { useUserProfile } from '@/app/context/user';
import { NewGenSearchIcon, HistoryIcon } from './Icons';
import { generateImage } from '@/lib/imageActions';
import { generateAudio, type AudioGenerationResponse } from '@/lib/audioActions';
import { generateVideo, VideoGenerationParams  } from '@/lib/videoActions';
import { streamChatCompletion, type ChatMessage as AIChatAPIMessage } from '@/lib/chatActions';

// --- Interfaces and Types ---
export interface ImageGenParams { prompt: string; negative_prompt?: string; model?: string; size?: string; guidance_scale?: number; }
export interface AudioGenParams { prompt: string; negative_prompt?: string; duration_seconds?: number; seed?: number; model?: string; }
export interface VideoGenParams { prompt: string; negative_prompt?: string; guidance_scale?: number; num_frames?: number; duration?: number; model?: "ltx-video"; seed?: number; width?: number; height?: number; num_inference_steps?: number; decode_timestep?: number; decode_noise_scale?: number; upscale_and_refine?: boolean; }
export type AIChatParams = { model: string; temperature: number; top_p: number; max_tokens: number; };
export type Message = {
  messageId: string;
  chatId: string;
  createdAt: Date;
  content: string;
  role: 'user' | 'assistant';
  suggestions?: string[];
  sources?: Document[];
  type?: 'text' | 'image_prompt' | 'generated_image' | 'audio_prompt' | 'generated_audio' | 'video_prompt' | 'generated_video';
  imagePromptText?: string;
  audioPromptText?: string;
  videoPromptText?: string;
  b64Json?: string;
  b64JsonAudio?: string;
  b64JsonVideo?: string;
  status?: 'loading' | 'completed' | 'error' | 'streaming';
};

// --- useSocket Hook ---
const useSocket = (url: string, setIsWSReady: (ready: boolean) => void, setError: (error: boolean) => void) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const heartbeatInterval = 30000;
  const heartbeatTimeoutId = useRef<any>(null);

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
          if (data.type === 'pong') clearTimeout(heartbeatTimeoutId.current);
          else if (data.type === 'error') toast.error(data.data);
        });
        setWs(wsInstance);
      };

      const startHeartbeat = (socket: WebSocket) => {
        const sendPing = () => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'ping' }));
            heartbeatTimeoutId.current = setTimeout(() => socket.close(), heartbeatInterval - 7000);
          }
        };
        sendPing(); 
        const intervalId = setInterval(sendPing, heartbeatInterval);
        (socket as any).heartbeatIntervalId = intervalId; 
      };

      const stopHeartbeat = () => {
        clearTimeout(heartbeatTimeoutId.current);
        if (ws && (ws as any).heartbeatIntervalId) {
            clearInterval((ws as any).heartbeatIntervalId);
        }
      };
      connectWs();
    }
  }, [ws, url, setIsWSReady, setError]);
  return ws;
};

// --- Refactored loadMessages Function ---
const loadMessages = async (
  chatId: string,
  setMessages: (messages: Message[]) => void,
  setIsMessagesLoaded: (loaded: boolean) => void,
  setChatHistory: (history: [string, string][]) => void,
  setFocusMode: (mode: string) => void,
  setNotFound: (notFound: boolean) => void,
  setRightSidebarContent: (content: RightSidebarContent | null) => void // New parameter
) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/chats/${chatId}`,
      { headers: { 'Content-Type': 'application/json', Authorization: getCookie('token')! } }
    );
    if (res.status === 404) { setNotFound(true); return; }
    if (!res.ok) { toast.error("Failed to load messages."); return; }

    const data = await res.json();
    const messages = data.messages.map((msg: any) => {
      const metadata = JSON.parse(msg.metadata || '{}');
      return { ...msg, ...metadata, type: msg.type || metadata?.type || 'text', imagePromptText: msg.imagePromptText || metadata?.imagePromptText, audioPromptText: msg.audioPromptText || metadata?.audioPromptText, videoPromptText: msg.videoPromptText || metadata?.videoPromptText, b64Json: msg.b64Json || metadata?.b64Json, b64JsonAudio: msg.b64JsonAudio || metadata?.b64JsonAudio, b64JsonVideo: msg.b64JsonVideo || metadata?.b64JsonVideo, status: msg.status || metadata?.status, };
    }) as Message[];

    if (messages.length > 0) {
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      const currentQuery = lastUserMessage?.content || '';
      const historyForSearch = lastUserMessage ? messages.slice(0, messages.lastIndexOf(lastUserMessage)) : messages;
      setRightSidebarContent({ query: currentQuery, history: historyForSearch });
    } else {
      setRightSidebarContent(null);
    }

    setMessages(messages);
    const history = messages.filter(msg => msg.type === 'text' || !msg.type).map((msg) => [msg.role, msg.content] as [string, string]);
    if (messages.length > 0 && messages[0].content) document.title = messages[0].content;
    setChatHistory(history);
    setFocusMode(data.chat.focusMode);
  } catch (error) {
    toast.error("An error occurred while loading the chat.");
    console.error(error);
  } finally {
    setIsMessagesLoaded(true);
  }
};


// =================== Main ChatWindow Component ===================
const ChatWindow = ({ id }: { id?: string }) => {
  const { isLoggedIn } = useUserProfile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMessage = searchParams.get('q');
  
  const [chatId, setChatId] = useState<string | undefined>(id);
  const [hasError, setHasError] = useState(false);
  const [isWSReady, setIsWSReady] = useState(false);
  const ws = useSocket(process.env.NEXT_PUBLIC_WS_URL!, setIsWSReady, setHasError);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<[string, string][]>([]);
  const [focusMode, setFocusMode] = useState('webSearch');
  const [isMessagesLoaded, setIsMessagesLoaded] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesRef = useRef<Message[]>(messages);
  messagesRef.current = messages;

  const { setRightSidebarContent } = useLayout();

  // Primary effect to load data or reset state based on the URL `id`
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/sign-in');
      return;
    }
    if (id) {
      setIsMessagesLoaded(false); 
      setChatId(id);
      // Pass the sidebar setter to the load function
      loadMessages(id, setMessages, setIsMessagesLoaded, setChatHistory, setFocusMode, setNotFound, setRightSidebarContent);
    } else {
      // This is a new chat, so reset everything
      setChatId(undefined);
      setMessages([]);
      setChatHistory([]);
      setNotFound(false);
      setRightSidebarContent(null); // Clear the right sidebar
      setIsMessagesLoaded(true); 
    }
  }, [id, isLoggedIn, router, setRightSidebarContent]);

  const closeWebSocket = useCallback(() => {
    if (ws?.readyState === 1) { ws.close(); }
  }, [ws]);

  useEffect(() => { return closeWebSocket; }, [closeWebSocket]);

  // Helper to create a new chat on the first message
  const ensureChatId = useCallback((): string => {
    if (chatId) return chatId;
    const newChatId = crypto.randomBytes(20).toString('hex');
    router.replace(`/chat/${newChatId}`);
    setChatId(newChatId);
    router.refresh(); 
    return newChatId;
  }, [chatId, router]);
  
  const sendMessage = async (messageContent: string, file: File | null = null) => {
    if (loading || isGenerating) return;
    setLoading(true);
    const currentChatId = ensureChatId();
    let sources: Document[] | undefined = undefined;
    let recievedMessage = ''; let added = false;
    const userMessageId = crypto.randomBytes(7).toString('hex');

    setMessages((prev) => [...prev, { content: messageContent, messageId: userMessageId, chatId: currentChatId, role: 'user', createdAt: new Date(), type: 'text' }]);
    if (file) console.log("File upload initiated:", file.name);

    ws?.send(JSON.stringify({ type: 'message', message: { chatId: currentChatId, content: messageContent }, focusMode: focusMode, history: [...chatHistory, ['human', messageContent]] }));

    const messageHandler = async (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      if (data.type === 'error') { toast.error(data.data); setLoading(false); return; }
      if (data.type === 'sources') {
        sources = data.data;
        if (!added) { setMessages((prev) => [...prev, { content: '', messageId: data.messageId, chatId: currentChatId, role: 'assistant', sources: sources, createdAt: new Date(), type: 'text' }]); added = true; }
      }
      if (data.type === 'message') {
        if (!added) { setMessages((prev) => [...prev, { content: data.data, messageId: data.messageId, chatId: currentChatId, role: 'assistant', sources: sources, createdAt: new Date(), type: 'text' }]); added = true; }
        setMessages((prev) => prev.map((m) => m.messageId === data.messageId ? { ...m, content: m.content + data.data } : m));
        recievedMessage += data.data;
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
    if (isGenerating || loading) { toast.info("Another operation is in progress."); return; }
    setIsGenerating(true);
    const currentChatId = ensureChatId();
    const userPromptMsgId = crypto.randomBytes(7).toString('hex');
    const assistantImgMsgId = crypto.randomBytes(7).toString('hex');
    setMessages((prev) => [...prev, { messageId: userPromptMsgId, chatId: currentChatId, createdAt: new Date(), content: `Generating image for: "${imagePromptText}"`, role: 'user', type: 'image_prompt', imagePromptText, status: 'loading' }]);
    try {
      const result = await generateImage(params);
      if (result.data?.[0]?.b64_json) {
        setMessages((prev) => prev.map((m) => m.messageId === userPromptMsgId ? { ...m, status: 'completed', content: `Image prompt: "${imagePromptText}"` } : m));
        setMessages((prev) => [...prev, { messageId: assistantImgMsgId, chatId: currentChatId, createdAt: new Date(), content: '', role: 'assistant', type: 'generated_image', b64Json: result.data[0].b64_json, imagePromptText }]);
        toast.success('Image generated!');
      } else { throw new global.Error(result.error ?? "No image data returned from API."); }
    } catch (err: any) {
      toast.error(`Image generation failed: ${err.message}`);
      setMessages((prev) => prev.map((m) => m.messageId === userPromptMsgId ? { ...m, status: 'error', content: `Failed image prompt: "${imagePromptText}". Error: ${err.message}` } : m));
    } finally { setIsGenerating(false); }
  };

  const handleAudioGenerationRequest = async (params: AudioGenParams, audioPromptText: string) => {
    if (isGenerating || loading) { toast.info("Another operation is in progress."); return; }
    setIsGenerating(true);
    const currentChatId = ensureChatId();
    const userPromptMsgId = crypto.randomBytes(7).toString('hex');
    const assistantAudioMsgId = crypto.randomBytes(7).toString('hex');
    setMessages((prev) => [...prev, { messageId: userPromptMsgId, chatId: currentChatId, createdAt: new Date(), content: `Generating audio for: "${audioPromptText}"`, role: 'user', type: 'audio_prompt', audioPromptText, status: 'loading' }]);
    try {
      const result: AudioGenerationResponse = await generateAudio(params);
      if (result.data?.[0]?.b64_json) {
        setMessages((prev) => prev.map((m) => m.messageId === userPromptMsgId ? { ...m, status: 'completed', content: `Audio prompt: "${audioPromptText}"` } : m));
        setMessages((prev) => [...prev, { messageId: assistantAudioMsgId, chatId: currentChatId, createdAt: new Date(), content: '', role: 'assistant', type: 'generated_audio', b64JsonAudio: result.data[0].b64_json, audioPromptText }]);
        toast.success('Audio generated!');
      } else { throw new global.Error(result.error || 'No audio data returned from API.'); }
    } catch (err: any) {
      toast.error(`Audio generation failed: ${err.message}`);
      setMessages((prev) => prev.map((m) => m.messageId === userPromptMsgId ? { ...m, status: 'error', content: `Failed audio prompt: "${audioPromptText}". Error: ${err.message}` } : m));
    } finally { setIsGenerating(false); }
  };

  const handleVideoGenerationRequest = async (params: VideoGenParams, videoPromptText: string) => {
    if (isGenerating || loading) { toast.info("Another operation is in progress."); return; }
    setIsGenerating(true);
    const currentChatId = ensureChatId();
    const userPromptMsgId = crypto.randomBytes(7).toString('hex');
    const assistantVideoMsgId = crypto.randomBytes(7).toString('hex');
    setMessages((prev) => [...prev, { messageId: userPromptMsgId, chatId: currentChatId, createdAt: new Date(), content: `Generating video for: "${videoPromptText}"`, role: 'user', type: 'video_prompt', videoPromptText, status: 'loading' }]);
    try {
      const result: any = await generateVideo(params as VideoGenerationParams);
      if (result.status === "processing") {
         setMessages((prev) => prev.map((m) => m.messageId === userPromptMsgId ? { ...m, status: 'loading', content: `Processing video for: "${videoPromptText}"` } : m));
         toast.info('Video is processing...');
         return;
      }
      if (result.data?.[0]?.b64_json) {
          setMessages((prev) => prev.map((m) => m.messageId === userPromptMsgId ? { ...m, status: 'completed', content: `Video prompt: "${videoPromptText}"` } : m));
          setMessages((prev) => [...prev, { messageId: assistantVideoMsgId, chatId: currentChatId, createdAt: new Date(), content: '', role: 'assistant', type: 'generated_video', b64JsonVideo: result.data[0].b64_json, videoPromptText }]);
          toast.success('Video generated!');
      } else if (result.status && result.status !== "processing") {
           throw new Error(result.error || result.status || "Video data not found or generation failed.");
      } else if (!result.status) {
          throw new globalThis.Error("Unknown error: No video data or status returned.");
      }
    } catch (err: any) {
      toast.error(`Video generation failed: ${err.message}`);
      setMessages((prev) => prev.map((m) => m.messageId === userPromptMsgId ? { ...m, status: 'error', content: `Failed video prompt: "${videoPromptText}". Error: ${err.message}` } : m));
    } finally {
      const finalUserMessageState = messagesRef.current.find(m => m.messageId === userPromptMsgId);
      if (finalUserMessageState?.status !== 'loading' || !finalUserMessageState.content.startsWith("Processing video for:")) { setIsGenerating(false); }
    }
  };
  
  const handleAIChatRequest = useCallback(async (prompt: string, params: AIChatParams) => {
      if (isGenerating || loading) { toast.info('Another operation is in progress.'); return; }
      const currentChatId = ensureChatId();
      setIsGenerating(true);
      const userMessageId = crypto.randomBytes(7).toString('hex');
      const assistantMessageId = crypto.randomBytes(7).toString('hex');
      setMessages((prev) => [...prev, { messageId: userMessageId, chatId: currentChatId, createdAt: new Date(), content: prompt, role: 'user', type: 'text' }]);
      setMessages((prev) => [...prev, { messageId: assistantMessageId, chatId: currentChatId, createdAt: new Date(), content: '', role: 'assistant', type: 'text', status: 'streaming' }]);
      try {
        const apiMessages: AIChatAPIMessage[] = [...messagesRef.current.filter(m => m.type === 'text' && (m.role === 'user' || m.role === 'assistant')).map(m => ({ role: m.role, content: m.content } as AIChatAPIMessage)), { role: 'user', content: prompt }];
        const stream = await streamChatCompletion({ ...params, messages: apiMessages });
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let accumulatedResponse = ''; let done = false; let buffer = '';
        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          const chunk = decoder.decode(value, { stream: !done });
          buffer += chunk;
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonString = line.substring(5).trim();
              if (jsonString === '[DONE]') { done = true; break; }
              if (jsonString) {
                try {
                  const parsedChunk = JSON.parse(jsonString);
                  if (parsedChunk.choices && parsedChunk.choices[0]?.delta?.content) {
                    const contentPiece = parsedChunk.choices[0].delta.content;
                    accumulatedResponse += contentPiece;
                    setMessages((prev) => prev.map((m) => m.messageId === assistantMessageId ? { ...m, content: accumulatedResponse, status: 'streaming' } : m));
                  }
                  if (parsedChunk.choices && parsedChunk.choices[0]?.finish_reason === 'stop') { done = true; break; }
                } catch (e) { console.error('Failed to parse stream chunk JSON:', jsonString, e); }
              }
            }
          }
          if (done && buffer.startsWith('data: ')) {
            const jsonString = buffer.substring(5).trim();
            if (jsonString !== '[DONE]' && jsonString) {
              try {
                const parsedChunk = JSON.parse(jsonString);
                if (parsedChunk.choices && parsedChunk.choices[0]?.delta?.content) {
                  accumulatedResponse += parsedChunk.choices[0].delta.content;
                  setMessages((prev) => prev.map((m) => m.messageId === assistantMessageId ? { ...m, content: accumulatedResponse, status: 'streaming' } : m));
                }
              } catch (e) {}
            }
          }
        }
        setMessages((prev) => prev.map((m) => m.messageId === assistantMessageId ? { ...m, status: 'completed' } : m));
        setChatHistory((prev) => [...prev, ['user', prompt], ['assistant', accumulatedResponse]]);
      } catch (err: any) {
        console.error('AI Chat stream error:', err);
        toast.error(`AI Chat failed: ${err.message}`);
        setMessages((prev) => prev.map((m) => m.messageId === assistantMessageId ? { ...m, content: `Error: ${err.message}`, status: 'error' } : m));
      } finally { setIsGenerating(false); }
    }, [isGenerating, loading, ensureChatId]
  );
  
  const rewrite = (messageId: string) => { /* ... */ };
  const editMessage = (messageId: string, newContent: string) => { setMessages((prev) => prev.map((msg) => msg.messageId === messageId ? { ...msg, content: newContent } : msg)); };
  
  useEffect(() => {
    if (isMessagesLoaded && isWSReady && initialMessage && messages.length === 0) {
      handleAIChatRequest(initialMessage, { model: "qwen-3", temperature: 0.7, top_p: 1, max_tokens: 1000 });
    }
  }, [isMessagesLoaded, isWSReady, initialMessage, handleAIChatRequest]);

  // =================== RENDER LOGIC ===================
  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-gray-600 dark:text-gray-400">Connection error. Please try again.</p>
      </div>
    );
  }

  // Show the skeleton for the main content area while loading
  if (!isMessagesLoaded) {
    return <ChatSkeleton />;
  }
console.log(messages, "messages here?")
  // Once loaded, render the appropriate view in the main column
  return (
    <div className="h-full w-full">
      {notFound ? (
        <Error statusCode={404} />
      ) : messages.length > 0 ? (
        <Chat
          loading={loading || isGenerating}
          messages={messages}
          sendMessage={sendMessage}
          onImagePromptSubmit={handleImageGenerationRequest}
          onAudioPromptSubmit={handleAudioGenerationRequest}
          onVideoPromptSubmit={handleVideoGenerationRequest}
          onAIChatSubmit={handleAIChatRequest}
          rewrite={rewrite}
          editMessage={editMessage}
          setMessages={setMessages}
        />
      ) : (
        <EmptyChat
          sendMessage={sendMessage}
          onImagePromptSubmit={handleImageGenerationRequest}
          onAudioPromptSubmit={handleAudioGenerationRequest}
          onVideoPromptSubmit={handleVideoGenerationRequest}
          onAIChatSubmit={handleAIChatRequest}
          focusMode={focusMode}
          setFocusMode={setFocusMode}
        />
      )}
    </div>
  );
};

export default ChatWindow;












