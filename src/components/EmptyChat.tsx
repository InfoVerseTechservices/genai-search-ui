import { Settings } from 'lucide-react';
import EmptyChatMessageInput from './EmptyChatMessageInput';
import { File } from './ChatWindow';
import Link from 'next/link';
import WeatherWidget from './WeatherWidget';
import NewsArticleWidget from './NewsArticleWidget';
import { getTimeBasedGreeting, getRandomEmoji } from '@/utils/helpers';
import { useUserProfile } from '@/context/UserContext';

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
  focusMode,
  setFocusMode,
  optimizationMode,
  setOptimizationMode,
  fileIds,
  setFileIds,
  files,
  setFiles,
}: {
  sendMessage: (message: string, isImageGeneration?: boolean, useTooling?: boolean) => void;
  focusMode: string;
  setFocusMode: (mode: string) => void;
  optimizationMode: string;
  setOptimizationMode: (mode: string) => void;
  fileIds: string[];
  setFileIds: (fileIds: string[]) => void;
  files: File[];
  setFiles: (files: File[]) => void;
}) => {
  const { userDetails, isLoggedIn } = useUserProfile();
  const username = isLoggedIn && userDetails?.name ? userDetails.name : 'Helper';
  
  // Check for recent activity
  const mockLastActive = new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(); // 6 hours ago
  const lastActive = userDetails?.lastActive || mockLastActive;
  const isReturning = isLoggedIn && isRecentActivity(lastActive);
  
  const titleText = username && username !== 'Helper'
    ? isReturning
      ? `${getRandomEmoji()} Welcome back, ${username}`
      : `${getRandomEmoji()} ${getTimeBasedGreeting()}, ${username}`
    : `${getRandomEmoji()} ${getTimeBasedGreeting()}! I'm here if you need anything.`;
    
  const subtitleText = username && username !== 'Helper'
    ? isReturning
      ? 'Ready to pick up where we left off?'
      : 'What would you like to explore today?'
    : 'Start by sharing a thought or asking a question.';

  return (
    <div className="flex flex-col justify-center h-screen">
      <div className="absolute w-full flex flex-row items-center justify-end pr-4 sm:pr-5 pt-4 sm:pt-5 z-10">
        <Link href="/settings">
          <Settings className="cursor-pointer lg:hidden min-h-touch min-w-touch p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation" size={20} />
        </Link>
      </div>
      <div className="overflow-y-auto flex flex-col items-center justify-center p-4 text-center">
        <h2 className="dark:text-blue-300 text-xl sm:text-2xl md:text-3xl lg:text-3xl font-medium">
          {titleText}
        </h2>
        <p className="text-sm text-gray-400 mt-4">
          {subtitleText}
        </p>
        <div className="flex flex-col w-full gap-3 sm:gap-4 mt-6 sm:flex-row sm:justify-center max-w-4xl">
          <div className="flex-1 w-full min-w-0">
            <WeatherWidget />
          </div>
          <div className="flex-1 w-full min-w-0">
            <NewsArticleWidget />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 w-full bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700 py-3 md:py-4 z-10">
        <div className="w-full max-w-5xl mx-auto px-5">
          <EmptyChatMessageInput
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
        </div>
      </div>
    </div>
  );
};

export default EmptyChat;
