'use client';

import Image from 'next/image';
import LightThemeLogo from '../public/images/lightTheme_logo.png';
import DarkThemeLogo from '../public/images/darkTheme_logo.png';
import { ArrowLeft } from './Icons';
import { useRouter } from 'next/navigation';
import ChatPageUI from './ChatPageUI';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  return (
    <main className="bg-white dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#E3E3E3] dark:border-gray-700 bg-white dark:bg-slate-900 h-[60px] md:h-[70px]">
        {/* Desktop Header - Centered Logo */}
        <div className="hidden md:flex items-center justify-center h-full">
          <div className="py-4 relative">
            {/* Light theme logo */}
            <Image
              src={LightThemeLogo}
              alt="ColomboAI Light Logo"
              className="w-[250px] h-auto block dark:hidden"
              priority
            />
            {/* Dark theme logo */}
            <Image
              src={DarkThemeLogo}
              alt="ColomboAI Dark Logo"
              className="w-[250px] h-auto hidden dark:block"
              priority
            />
          </div>
        </div>

        {/* Mobile Header - Back Button + Centered Logo */}
        <div className="md:hidden flex items-center justify-between h-full px-4">
          {/* Back Button */}
          <button
            onClick={() => router.push('/')}
            aria-label="Go back to home"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={24} color="#374151" />
          </button>

          {/* Centered Logo */}
          <div className="flex-1 flex justify-center relative">
            <Image
              src={LightThemeLogo}
              alt="ColomboAI Light Logo"
              className="w-[130px] h-auto block dark:hidden"
              priority
            />
            <Image
              src={DarkThemeLogo}
              alt="ColomboAI Dark Logo"
              className="w-[130px] h-auto hidden dark:block"
              priority
            />
          </div>

          {/* Spacer to balance layout */}
          <div className="w-10"></div>
        </div>
      </header>

     <div className='h-full overflow-y-clip '>
 {children}
     </div>
       
    </main>
  );
};

export default Layout;

