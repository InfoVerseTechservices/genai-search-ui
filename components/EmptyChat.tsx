'use client';

import { useUserProfile } from '@/app/context/user';
import EmptyChatMessageInput, {
  VideoGenParams,
  ImageGenParams,
  AudioGenParams,
  AIChatParams,
} from './EmptyChatMessageInput';

interface EmptyChatProps {
  sendMessage: (message: string, file: File | null) => void;
  onImagePromptSubmit: (params: ImageGenParams, imagePromptText: string) => void;
  onAudioPromptSubmit: (params: AudioGenParams, audioPromptText: string) => void;
  onVideoPromptSubmit: (params: VideoGenParams, videoPromptText: string) => void;
  onAIChatSubmit: (prompt: string, params: AIChatParams) => void;
  focusMode: string;
  setFocusMode: (mode: string) => void;
}

// --- Helper functions ---

// Time-based greeting depending on user’s timezone
const getTimeBasedGreeting = (timezone: string = 'UTC') => {
  const now = new Date().toLocaleString('en-US', { timeZone: timezone });
  const hour = new Date(now).getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// Emoji generator
const getRandomEmoji = (): string => {
  const emojis = ['👋', '✨', '🌞', '😄'];
  return emojis[Math.floor(Math.random() * emojis.length)];
};

// Check if the user was recently active
const isRecentActivity = (lastActive?: string): boolean => {
  if (!lastActive) return false;
  const last = new Date(lastActive);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  return diffMs < 1000 * 60 * 60 * 12; // active within 12 hours
};

const EmptyChat = ({
  sendMessage,
  onImagePromptSubmit,
  onAudioPromptSubmit,
  onVideoPromptSubmit,
  onAIChatSubmit,
  focusMode,
  setFocusMode,
}: EmptyChatProps) => {
  const { userDetails } = useUserProfile();

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const greeting = getTimeBasedGreeting(timezone);
  const emoji = getRandomEmoji();

  const userName =
    userDetails?.first_name || userDetails?.name || userDetails?.username || '';

  // Replace this mock with real userDetails?.lastActive from API/localStorage if available
  const mockLastActive = new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(); // 6 hours ago
  const lastActive = userDetails?.lastActive || mockLastActive;
  const isReturning = isRecentActivity(lastActive);

  const titleText = userName
    ? isReturning
      ? `${emoji} Welcome back, ${userName}`
      : `${emoji} ${greeting}, ${userName}`
    : `${emoji} ${greeting}! I'm here if you need anything.`;

  return (
    <div className="flex flex-col justify-center h-screen">
      <div className="overflow-y-auto flex flex-col items-center justify-center p-4 text-center">
        <h2 className="dark:text-blue-300 text-xl sm:text-2xl md:text-3xl lg:text-3xl font-medium">
          {titleText}
        </h2>
        <p className="text-sm text-gray-400 mt-4">
          {userName
            ? isReturning
              ? 'Ready to pick up where we left off ?'
              : 'What would you like to explore today ?'
            : 'Start by sharing a thought or asking a question.'}
        </p>
      </div>

      <div className="sticky bottom-0 w-full bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700 py-3 md:py-4 z-10">
        <div className="w-full max-w-5xl mx-auto px-5">
          <EmptyChatMessageInput
            sendMessage={sendMessage}
            onImagePromptSubmit={onImagePromptSubmit}
            onAudioPromptSubmit={onAudioPromptSubmit}
            onVideoPromptSubmit={onVideoPromptSubmit}
            onAIChatSubmit={onAIChatSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default EmptyChat;
