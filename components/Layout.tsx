import Image from "next/image";
import Logo from "../public/ColomboAI-logo.svg"
import ProfileLoader from "./ProfileLoader";
import Link from "next/link";
import { HistoryIcon, NewGenSearchIcon } from "./Icons";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="bg-white sm:pl-0 md:pl-20 lg:pl-20 min-h-screen">
      <header className="sticky top-0 z-50 xl:border-b-[1px] w-full flex flex-row justify-center lg:border-b-[1px] border-[#E3E3E3] bg-white sm:border-0">

        <div className="py-[14px] md:flex hidden lg:flex sm:hidden">

          <Image src={Logo} alt='ColomboAI' className='w-[10rem]' />

        </div>

        <div className="py-[14px] sm:flex md:hidden lg:hidden flex flex-row items-center w-full">
          <div className="w-6 h-6 absolute top-7 left-3">
            <ProfileLoader />
          </div>
          <div className="w-full flex flex-row justify-center">
            <Image src={Logo} alt='ColomboAI' className='w-[10rem]' />
          </div>
          {/* <div className="flex space-x-4 mr-8 mt-3">
                  <button>
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 mb-1">
                        <NewGenSearchIcon w={24} h={24} fill={'#8E8E93'} />
                      </div>
 
                    </div>
                  </button>
                  <Link href='https://caidev.colomboai.com/genai-search/library/'>
                    <div className="flex flex-col items-center">
                      <div className="w-8 sm:w-6 h-6 mb-1">
                        <HistoryIcon w={24} h={24} fill={'#8E8E93'} />
                      </div>
       
                    </div>
                  </Link>
                 
           
                </div> */}
        </div>
      </header>
      <div className="max-w-screen-lg lg:mx-auto mx-4 ">{children}</div>
    </main>
  );
};

export default Layout;
