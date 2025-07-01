import ChatWindow from '@/components/ChatWindow';
import LayoutClientWrapper from '@/components/LayoutClientWrapper';
import { Suspense } from 'react';

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
      <LayoutClientWrapper>
        <ChatWindow/>
      </LayoutClientWrapper>
    </Suspense>
  );
};

export default Home;