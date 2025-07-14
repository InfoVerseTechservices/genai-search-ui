'use client';

import Image from 'next/image';
import { Menu, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
  onMobileMenuToggle?: () => void;
  onMobileNewChat?: () => void;
}

const Layout = ({ children, onMobileMenuToggle, onMobileNewChat }: LayoutProps) => {
  const router = useRouter();

  return (
    <main className="bg-white dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#E3E3E3] dark:border-gray-700 bg-white dark:bg-slate-900 h-[60px] sm:h-[65px] md:h-[70px]">
        {/* Desktop Header - Centered Logo */}
        <div className="hidden md:flex items-center justify-center h-full px-4">
          <div className="py-3 sm:py-4 relative">
            {/* Light theme logo */}
            <Image
              src="/images/lightTheme_logo.png"
              alt="ColomboAI Light Logo"
              className="w-[200px] lg:w-[250px] h-auto block dark:hidden"
              width={250}
              height={60}
              priority
            />
            {/* Dark theme logo */}
            <Image
              src="/images/darkTheme_logo.png"
              alt="ColomboAI Dark Logo"
              className="w-[200px] lg:w-[250px] h-auto hidden dark:block"
              width={250}
              height={60}
              priority
            />
          </div>
        </div>

        {/* Mobile Header - Menu Button + Centered Logo + New Chat Button */}
        <div className="md:hidden flex items-center justify-between h-full px-3 sm:px-4">
          {/* Hamburger Menu Button */}
          <button
            onClick={onMobileMenuToggle}
            aria-label="Toggle menu"
            className="min-h-touch min-w-touch p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 touch-manipulation no-select"
          >
            <Menu size={18} className="sm:size-5" />
          </button>

          {/* Centered Logo */}
          <div className="flex-1 flex justify-center relative px-2">
            <Image
              src="/images/lightTheme_logo.png"
              alt="ColomboAI Light Logo"
              className="w-[110px] xs:w-[120px] sm:w-[140px] h-auto block dark:hidden"
              width={140}
              height={35}
              priority
            />
            <Image
              src="/images/darkTheme_logo.png"
              alt="ColomboAI Dark Logo"
              className="w-[110px] xs:w-[120px] sm:w-[140px] h-auto hidden dark:block"
              width={140}
              height={35}
              priority
            />
          </div>

          {/* New Chat Button */}
          <button
            onClick={onMobileNewChat}
            aria-label="New chat"
            className="min-h-touch min-w-touch p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 touch-manipulation no-select"
          >
            <Plus size={18} className="sm:size-5" />
          </button>
        </div>
      </header>

      <div className='h-full overflow-y-clip'>
        {children}
      </div>
    </main>
  );
};

export default Layout;