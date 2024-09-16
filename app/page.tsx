import ChatWindow from '@/components/ChatWindow';
import { Metadata } from 'next';
import { Suspense } from 'react';
import Logo from "../public/ColomboAI-logo.svg"
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Chat - Perplexica',
  description: 'Chat with the internet, chat with Perplexica.',
};

const Home = () => {
  return (
    <div className='flex flex-col items-center'>
      <Suspense>
        <ChatWindow />
      </Suspense>
    </div>
  );
};

export default Home;
