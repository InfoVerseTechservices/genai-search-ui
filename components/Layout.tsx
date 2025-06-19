// components/Layout.tsx
'use client'; // Add 'use client' for useRouter
import Image from 'next/image';
import Logo from '../public/ColomboAI-logo.svg';
// import ProfileLoader from './ProfileLoader'; // No longer needed here if replaced
import Link from 'next/link'; // Keep if other links are present, not strictly needed for back button
import { HistoryIcon, NewGenSearchIcon, ArrowLeft } from './Icons'; // Added ArrowLeft
import { useRouter } from 'next/navigation'; // Import useRouter

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter(); // Initialize router

  return (
    <main className="bg-white dark:bg-slate-900 sm:pl-0 md:pl-20 lg:pl-20 min-h-screen"> {/* Added dark:bg-slate-900 */}
      <header className="sticky top-0 z-40 xl:border-b-[1px] w-full flex flex-row justify-center lg:border-b-[1px] border-[#E3E3E3] dark:border-gray-700 bg-white dark:bg-slate-900 sm:border-0 h-[60px] md:h-auto"> {/* Added dark mode, set explicit height for mobile consistency */}

        {/* Desktop Header */}
        <div className="py-[14px] md:flex hidden lg:flex sm:hidden items-center"> {/* Added items-center */}
          <Image src={Logo} alt="ColomboAI" className="w-[10rem]" />
        </div>

        {/* Mobile Header */}
        <div className="py-[14px] sm:flex md:hidden lg:hidden flex flex-row items-center w-full h-full px-3"> {/* Added h-full, px-3 */}
          {/* Back button on the left */}
          <div className="flex-none">
            <button
              onClick={() => router.back()}
              title="Go back"
              className="p-2 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <ArrowLeft size={24} />
            </button>
          </div>

          {/* Centered Logo */}
          <div className="flex-grow flex justify-center">
            <Image src={Logo} alt="ColomboAI" className="w-[8rem] sm:w-[9rem]" /> {/* Slightly smaller logo on mobile */}
          </div>

          {/* Placeholder for potential right-side icons on mobile header, ensure it balances the left button for centering logo */}
          <div className="flex-none w-[40px]"> {/* Width approx matching the back button's space */}
             {/* This space is reserved for the top-right icons that will be handled by ChatWindow.tsx */}
          </div>
        </div>
      </header>
      <div className="max-w-screen-lg lg:mx-auto mx-4 pt-[60px] md:pt-0">{children}</div> {/* Added pt-[60px] for mobile to account for fixed header, md:pt-0 */}
    </main>
  );
};

export default Layout;
