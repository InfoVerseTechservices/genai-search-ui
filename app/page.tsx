import ChatWindow from '@/components/ChatWindow';
import { Metadata } from 'next';
import { Suspense } from 'react';
import Logo from "../public/ColomboAI-logo.svg"
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'ColomboAI',
  //description: 'Chat with the internet, chat with Perplexica.',
};

const Home = () => {
  return (
    <div className='flex flex-col items-center justify-center overflow-hidden w-full'>
      {/* <head>
        <link rel="icon" href="/images/favicon.svg" />
      </head> */}
      <Suspense>
        <ChatWindow />
      </Suspense>
    </div>
  );
};

export default Home;
