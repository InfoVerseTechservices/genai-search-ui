'use client'
import React, { useEffect, useState, FunctionComponent as FC } from 'react'
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import ProfilePicture from "@/components/LeftSidebar/ProfilePicture"
import { FeedIcon, VibesIcon, GenAiIcon, ShopIcon, NewsIcon, StarIcon, NewGenSearchIcon, HistoryIcon } from "./Icons"


interface IconProps {
  w: number;
  h: number;
  fill: string;
}

type IconComponent = FC<IconProps>;

interface IconLinkProps {
  href: string;
  Icon: IconComponent;
  label: string;
}

const IconLink: FC<IconLinkProps> = ({ href, Icon, label }) => {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link href={href}>
      <div className="flex flex-col items-center">
        <div className="w-6 h-6 mb-1">
          <Icon 
            w={24} 
            h={24} 
            fill={isActive ? "#1E71F2" : "#8E8E93"}
          />
        </div>
        <p className={`
          ${isActive ? "text-[#1E71F2]" : "text-[#8E8E93]"}
          text-center text-[10px]
        `}>
          {label}
        </p> 
      </div>
    </Link>
  )
}

const LeftSidebar: FC = () => {
    const [profilePic, setProfilePic] = useState<string | undefined>(undefined)
    const router = useRouter()

    useEffect(() => {
        setProfilePic(localStorage.getItem('profilePic') || undefined)
    }, [])

    const handleSignOut = () => {
        localStorage.removeItem('profilePic')
        router.push("/sign-up")
    };

    return (
        <div className="w-16 bg-white h-screen  flex flex-col items-center py-4 border-r border-gray-200">
            <div className="mt-0 mb-6">
                <ProfilePicture image={profilePic} />
            </div>
            <div className="flex flex-col items-center space-y-6 flex-grow">
            {/* <IconLink 
                  href="https://colomboai.com/genai-search"
                  Icon={GenAiIcon as IconComponent}
                  label="Gen AI"
                /> */}
   <div className="flex flex-col items-center">
        <div className="w-6 h-6 mb-1">
          <GenAiIcon 
            w={24} 
            h={24} 
            fill={"#8E8E93"}
          />
        </div>
        <p className={`
          ${"text-[#8E8E93]"}
          text-center text-[10px]
        `}>
          Gen AI
        </p> 
      </div>

      <div className="flex flex-col items-center">
        <div className="w-6 h-6 mb-1">
          <VibesIcon 
            w={24} 
            h={24} 
            fill={"#8E8E93"}
          />
        </div>
        <p className={`
          ${"text-[#8E8E93]"}
          text-center text-[10px]
        `}>
          Vibes
        </p> 
      </div>
      <div className="flex flex-col items-center">
        <div className="w-6 h-6 mb-1">
          <FeedIcon 
            w={24} 
            h={24} 
            fill={"#8E8E93"}
          />
        </div>
        <p className={`
          ${"text-[#8E8E93]"}
          text-center text-[10px]
        `}>
          Feed
        </p> 
      </div>
      <div className="flex flex-col items-center">
        <div className="w-6 h-6 mb-1">
          <ShopIcon 
            w={24} 
            h={24} 
            fill={"#8E8E93"}
          />
        </div>
        <p className={`
          ${"text-[#8E8E93]"}
          text-center text-[10px]
        `}>
          Shop
        </p> 
      </div>
      <div className="flex flex-col items-center">
        <div className="w-6 h-6 mb-1">
          <NewsIcon 
            w={24} 
            h={24} 
            fill={"#8E8E93"}
          />
        </div>
        <p className={`
          ${"text-[#8E8E93]"}
          text-center text-[10px]
        `}>
          News
        </p> 
      </div>
      
                {/* <IconLink 
                  href="https://colomboai.com/vibes"
                  Icon={VibesIcon as IconComponent}
                  label="Vibes"
                /> */}
                {/* <IconLink 
                  href="https://colomboai.com/feed"
                  Icon={FeedIcon as IconComponent}
                  label="Feed"
                /> */}
                {/* <IconLink 
                  href="https://colomboai.com/shop"
                  Icon={ShopIcon as IconComponent}
                  label="Shop"
                /> */}
                {/* <IconLink 
                  href="https://colomboai.com/news"
                  Icon={NewsIcon as IconComponent}
                  label="News"
                /> */}
                <div className="flex flex-col items-center">
                    <StarIcon 
                      w={24} 
                      h={24} 
                      fill="#8E8E93"
                    />
                </div>

            <IconLink 
            href='https://colomboai.com/genai-search'
            Icon={NewGenSearchIcon as IconComponent}
            label='New Chat'
            />
            <IconLink 
            href='https://colomboai.com/genai-search/library/'
            Icon={HistoryIcon as IconComponent}
            label='History'
            />
            </div>
            <div className="mt-auto">
                <button onClick={handleSignOut} className=" text-xs text-gray-400" disabled>
                    Sign Out
                </button>
            </div>
        </div>
    )
}

export default LeftSidebar

// 'use client'
// import React from 'react'
// import Link from "next/link"
// import { useEffect, useState } from "react"
// import { usePathname, useRouter } from "next/navigation"
// import ProfilePicture from "@/components/LeftSidebar/ProfilePicture"
// import { FeedIcon, GenAiIcon, NewsIcon, ShopIcon, VibesIcon, StarIcon } from "./Icons"

// const LeftSidebar: React.FC = () => {
//     const [name, setName] = useState<string | undefined>(undefined);
//     const [profilePic, setProfilePic] = useState<string | undefined>(undefined)

//     const pathname = usePathname()
//     const router = useRouter()

//     const feedSections = ['/feed', '/video', '/vibes', '/thoughts', '/images', '/explore', '/profile'];

//     useEffect(() => {
//         setName(localStorage.getItem('name') || undefined)
//         setProfilePic(localStorage.getItem('profilePic') || undefined)
//     }, [])

//     const handleSignOut = () => {
//         localStorage.removeItem('name');
//         localStorage.removeItem('profilePic')
//         router.push("/sign-up")
//     };

//     return (
//         <div className="w-[100%] mt-[20px] overflow-hidden">
//             <div className="mb-[46px] mt-[5px] relative">          
//                 <div className="flex z-50 justify-center items-center rounded-full hover:text-brandprimary cursor-pointer mx-auto">
//                     <ProfilePicture image={profilePic} />
//                 </div>
//             </div>
//             <div className="h-[75vh] overflow-hidden">

//                 {/* <Link href="https://colomboai.com/genai-search">
//                     <div className="mb-[50px]">
//                         <div className="w-[29px] mx-auto">
//                             <GenAiIcon w={30} h={30} fill="gray"/>
//                         </div>
//                          <p className="text-black text-center text-[14px] mt-[7px] font-sans">
//                             Gen AI
//                          </p> 
//                     </div>
//                 </Link> */}

//                 <Link href="https://colomboai.com/vibes">
//                     <div className="mb-[50px]">
//                         <div className="w-[29px] mx-auto">
//                             <VibesIcon w={30} h={30} fill="gray" />
//                         </div>
//                          <p className="text-black text-center text-[14px] mt-[7px] font-sans">
//                             Vibes
//                          </p> 
//                     </div>
//                 </Link>

//                 <Link href="https://colomboai.com/feed">
//                     <div className="mb-[50px]">
//                         <div className="w-[40px] mx-auto">
//                             <FeedIcon w={30} h={30} fill="gray" />
//                         </div>
//                          <p className="text-black text-center text-[14px] mt-[7px] font-sans">
//                             Feed
//                          </p> 
//                     </div>
//                 </Link>

//                 <Link href="https://colomboai.com/shop">
//                     <div className="mb-[50px]">
//                         <div className="w-[29px] mx-auto">
//                             <ShopIcon w={30} h={30} fill="gray" />
//                         </div>
//                          <p className="text-black text-center text-[14px] mt-[7px] font-sans">
//                             Shop
//                          </p> 
//                     </div>
//                 </Link>

//                 <Link href="/https://colomboai.com/news">
//                     <div className="mb-[50px]">
//                         <div className="w-[29px] mx-auto">
//                             <NewsIcon w={30} h={30} fill="gray" />
//                         </div>
//                          <p className="text-black text-center text-[14px] mt-[7px] font-sans">
//                             News
//                          </p> 
//                     </div>
//                 </Link>

//                 <div className="mb-[30px]">
//                   <div className="w-[50px] mx-auto">
//                     <StarIcon w={30} h={30} fill="gray" />
//                   </div>
//                 </div>

//             </div>
//         </div>
//     )
// }

//export default LeftSidebar