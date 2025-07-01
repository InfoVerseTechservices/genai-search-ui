// // components/Layout.tsx
// 'use client';
// import Image from 'next/image';
// import Logo from '../public/ColomboAI-logo.svg';
// import Link from 'next/link';
// import { ArrowLeft } from './Icons'; // Assuming ArrowLeft is from your Icons.tsx
// import { useRouter } from 'next/navigation';

// const Layout = ({ children }: { children: React.ReactNode }) => {
//   const router = useRouter();

//   return (
//     <main className="bg-white dark:bg-slate-900 min-h-screen">
//       <header className="sticky top-0 z-40 xl:border-b-[1px] w-full flex flex-row justify-center lg:border-b-[1px] border-[#E3E3E3] dark:border-gray-700 bg-white dark:bg-slate-900 sm:border-0 h-[60px] md:h-auto">

//         {/* Desktop Header */}
//         <div className="py-[14px] md:flex hidden lg:flex sm:hidden items-center ">
//           <Image src={Logo} alt="ColomboAI" className="w-[10rem]" />
//         </div>

//         {/* Mobile Header */}
//         <div className="py-[14px] sm:flex md:hidden lg:hidden flex flex-row items-center w-full h-full px-3">
//           {/* Back button on the left, now navigates to Home */}
//           <div className="flex-none">
//             <button
//               onClick={() => router.push('/')} // Changed to router.push('/')
//               title="Go to Home" // Updated title
//               className="p-2 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
//             >
//               <ArrowLeft size={24} />
//             </button>
//           </div>

//           {/* Centered Logo */}
//           <div className="flex-grow flex justify-center">
//             <Image src={Logo} alt="ColomboAI" className="w-[8rem] sm:w-[9rem]" />
//           </div>

//           {/* Placeholder for potential right-side icons */}
//           <div className="flex-none w-[40px]">
//           </div>
//         </div>
//       </header>
//       <div className="max-w-screen-lg lg:mx-auto mx-4 pt-[60px] md:pt-0">{children}</div>
//     </main>
//   );
// };

// export default Layout;



'use client';
import Image from 'next/image';
import Logo from '../public/ColomboAI-logo.svg';
import { ArrowLeft } from './Icons';
import { useRouter } from 'next/navigation';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  return (
    <main className="bg-white dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#E3E3E3] dark:border-gray-700 bg-white dark:bg-slate-900 h-[60px] md:h-[70px]">
        {/* Desktop Header - Centered Logo */}
        <div className="hidden md:flex items-center justify-center h-full">
          <div className="py-4">
            <Image 
              src={Logo} 
              alt="ColomboAI" 
              className="w-[160px] h-auto"
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
            <ArrowLeft 
              size={24} 
              color="#374151" // Tailwind's gray-700
            />
          </button>

          {/* Centered Logo */}
          <div className="flex-1 flex justify-center">
            <Image 
              src={Logo} 
              alt="ColomboAI" 
              className="w-[130px] h-auto"
              priority
            />
          </div>

          {/* Spacer to balance the layout */}
          <div className="w-10"></div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="w-full max-w-screen-lg mx-auto px-4 sm:px-6 pt-[60px] md:pt-6 pb-8">
        {children}
      </div>
    </main>
  );
};

export default Layout;
