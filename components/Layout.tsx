import Image from "next/image";
import Logo from "../public/ColomboAI-logo.svg"

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="bg-white pl-20 min-h-screen">
      <header className="sticky top-0 z-50 xl:border-b-[1px] w-full flex flex-row justify-center lg:border-b-[1px] border-[#E3E3E3] bg-white sm:border-0">
          <div className="py-[14px]">
            <Image src={Logo} alt='colombo' className='w-[10rem]'/>
          </div>
        </header>
      <div className="max-w-screen-lg lg:mx-auto mx-4">{children}</div>
    </main>
  );
};

export default Layout;
