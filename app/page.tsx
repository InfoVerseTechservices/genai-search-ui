// import ChatWindow from '@/components/ChatWindow';
// import { Metadata } from 'next';
// import { Suspense } from 'react';
// import Logo from "../public/ColomboAI-logo.svg"
// import Image from 'next/image';

// export const metadata: Metadata = {
//   title: 'ColomboAI',
//   //description: 'Chat with the internet, chat with Perplexica.',
// };

// const Home = () => {
//   return (
//     <div className='flex flex-col items-center overflow-hidden'>
//       {/* <head>
//         <link rel="icon" href="/images/favicon.svg" />
//       </head> */}
//       <Suspense>
//         <ChatWindow />
//       </Suspense>
//     </div>
//   );
// };

// export default Home;



import ChatWindow from '@/components/ChatWindow';
import LayoutClientWrapper from '@/components/LayoutClientWrapper';
import Layout from '@/components/MainNavBar';
import { Metadata } from 'next';
import { Suspense } from 'react';

// Metadata for the home page
export const metadata: Metadata = {
  title: 'New Chat | ColomboAI',
  description: 'Start a new conversation with ColomboAI.',
};

// This is the entire component.
// It renders the ChatWindow directly, without any extra wrapper divs.
const Home = () => {
  return (
    <Suspense fallback={<div>Loading Chat...</div>}>
      
      <LayoutClientWrapper>
      <ChatWindow />

      </LayoutClientWrapper>
    </Suspense>
  );
};

export default Home;