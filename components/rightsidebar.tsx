'use client';
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import ProfilePicture from "@/components/Rightsidebar/ProfilePicture";
import { useEffect, useState } from "react";
import Image from 'next/image';

// Import the image
import feedIconImage from "@/components/Rightsidebar/feediconimage/feed.png";  // Adjust the relative path as needed
import vibeImage from "@/components/Rightsidebar/feediconimage/vibes.png";
import StarImage from "@/components/Rightsidebar/feediconimage/star.png";

import genaiImage from "@/components/Rightsidebar/feediconimage/genai.png";
import shopImage from "@/components/Rightsidebar/feediconimage/shop.png";
import newsImage from "@/components/Rightsidebar/feediconimage/news.png";



/* eslint-disable @next/next/no-img-element */

const Rightsidebar: React.FC = () => {
    const [name, setName] = useState<string | undefined>(undefined);
    const [profilePic, setProfilePic] = useState<string | undefined>(undefined);

    const pathname = usePathname();
    const router = useRouter();

    const feedSections = ['/feed', '/video', '/vibes', '/thoughts', '/images', '/explore', '/profile'];

    useEffect(() => {
        setName(localStorage.getItem('name') || undefined); // Use localStorage or a different method
        setProfilePic(localStorage.getItem('profilePic') || undefined); // Use localStorage or a different method
    }, []);

    const handleSignOut = () => {
        localStorage.removeItem('name'); // Adjust based on your storage method
        localStorage.removeItem('profilePic'); // Adjust based on your storage method
        router.push("/sign-up");
    };

    return (
        <div className="w-[100%] mt-[20px] overflow-hidden">
            <div className="mb-[46px] mt-[5px] relative">
                <div className="flex z-50 justify-center items-center rounded-full hover:text-brandprimary cursor-pointer mx-auto">
                    <ProfilePicture image={profilePic} />
                </div>
            </div>
            <div className="h-[75vh] overflow-hidden text-black"> {/* Ensures text is black */}
                <Link href="https://colomboai.com/gen-search">
                    <div className="mb-[30px]"> {/* Reduced margin-bottom */}
                        <div className="w-[29px] mx-auto">
                            {/* Use imported image here */}
                            <Image src={genaiImage} alt="Gen AI Icon" width={40} height={40} />
                        </div>
                        {/* <p className="text-black text-center text-[14px] mt-[7px] font-sans">
                            Gen AI
                        </p> */}
                    </div>
                </Link>

                <Link href="https://colomboai.com/vibes">
                    <div className="mb-[30px]"> {/* Reduced margin-bottom */}
                        <div className="w-[29px] mx-auto">
                            {/* Use imported image here */}
                            <Image src={vibeImage} alt="Vibes Icon" width={30} height={30} />
                        </div>
                        {/* <p className="text-black text-center text-[14px] mt-[7px] font-sans">
                            Vibes
                        </p> */}
                    </div>
                </Link>

                <Link href="https://colomboai.com/feed">
                    <div className="mb-[30px]"> {/* Reduced margin-bottom */}
                        <div className="w-[40px] mx-auto">
                            {/* Use imported image here */}
                            <Image src={feedIconImage} alt="Feed Icon" width={40} height={40} />
                        </div>
                        {/* <p className="text-black text-center text-[14px] mt-[7px] font-sans">
                            Feed
                        </p> */}
                    </div>
                </Link>

                <Link href="https://colomboai.com/shop">
                    <div className="mb-[30px]"> {/* Reduced margin-bottom */}
                        <div className="w-[29px] mx-auto">
                            {/* Use imported image here */}
                            <Image src={shopImage} alt="Shopping Icon" width={30} height={30} />
                        </div>
                        {/* <p className="text-black text-center text-[14px] mt-[7px] font-sans">
                            Shop
                        </p> */}
                    </div>
                </Link>

                <Link href="https://colomboai.com/news">
                    <div className="mb-[30px]"> {/* Reduced margin-bottom */}
                        <div className="w-[29px] mx-auto">
                            {/* Use imported image here */}
                            <Image src={newsImage} alt="News Icon" width={30} height={30} />
                        </div>
                        {/* <p className="text-black text-center text-[14px] mt-[7px] font-sans">
                            News
                        </p> */}
                    </div>
                </Link>

                <div className="mb-[30px]"> {/* Reduced margin-bottom */}
                  <div className="w-[50px] mx-auto"> {/* Adjusted the size to 40px */}
                     {/* Use imported image here */}
                    <Image src={StarImage} alt="Star Icon" width={50} height={50} /> {/* Increased size to 40px */}
                  </div>
                     {/* <p className="text-black text-center text-[14px] mt-[7px] font-sans">
                          Star Icon
                      </p> */}
                </div>

            </div>
        </div>
    );
}

export default Rightsidebar;
