import ChatWindow from '@/components/ChatWindow';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Chat - ColomboAI',
  description: 'Chat with the internet, chat with ColomboAI.',
};

const Home = () => {
  return (
    <Suspense 
      fallback={
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <div
            className="w-8 h-8 mb-4 border-4 border-blue-500 border-solid rounded-full border-t-transparent animate-spin"
            role="status"
          />
          <p>Loading Chat...</p>
        </div>
      }
    >
      <ChatWindow />
    </Suspense>
  );
};

export default Home;
