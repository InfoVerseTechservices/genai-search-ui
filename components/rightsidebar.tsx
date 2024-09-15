'use client';
import { usePathname, useRouter } from "next/navigation";
import { FeedIcon } from '@/components/Icons';  // Adjust the relative path as needed
import Link from "next/link";
import ProfilePicture from "@/components/Rightsidebar/ProfilePicture";
import { useEffect, useState } from "react";

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
        <div className="w-[100%] mt-[60px]  overflow-hidden">
            <div className="mb-[46px] mt-[20px] relative">
                <div
                    className="flex z-50 justify-center items-center rounded-full hover:text-brandprimary cursor-pointer mx-auto"
                >
                    <ProfilePicture image={profilePic} />
                </div>
                {/* <ul className="min-w-[160px] rounded-lg bg-white shadow-md">
                    <Link href="/profile">
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer font-sans text-brandprimary">
                            {name}
                        </li>
                    </Link>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer font-sans" onClick={handleSignOut}>
                        Log out
                    </li>
                </ul> */}
            </div>
            <div className="h-[75vh] overflow-hidden">
                <Link href="/gen-search">
                    <div className="mb-[34px]">
                        <div className="w-[29px] mx-auto">
                            <FeedIcon w="30" h="30" fill={pathname === '/gen-search' ? "#1E71F2" : "#8E8E93"} />
                        </div>
                        <p className={`${pathname === '/gen-search' ? "text-brandprimary" : "text-sidebaricon"} text-center text-[14px] mt-[7px] font-sans`}>
                            Gen AI
                        </p>
                    </div>
                </Link>

                <Link href="/task-bot">
                    <div className="mb-[34px]">
                        <div className="w-[29px] mx-auto">
                            <FeedIcon w="30" h="30" fill={pathname === '/task-bot' ? "#1E71F2" : "#8E8E93"} />
                        </div>
                        <p className={`${pathname === '/task-bot' ? "text-brandprimary" : "text-sidebaricon"} text-center text-[14px] mt-[7px] font-sans`}>
                           Vibes
                        </p>
                    </div>
                </Link>

                <Link href="/feed">
                    <div className="mb-[34px]">
                        <div className="w-[29px] mx-auto">
                            <FeedIcon w="30" h="30" fill={feedSections.includes(pathname) ? "#1E71F2" : "#8E8E93"} />
                        </div>
                        <p className={`${feedSections.includes(pathname) ? "text-brandprimary" : "text-sidebaricon"} text-center text-[14px] mt-[7px] font-sans`}>
                            Feed
                        </p>
                    </div>
                </Link>

                <Link href="/shop">
                    <div className="mb-[34px]">
                        <div className="w-[29px] mx-auto">
                            <FeedIcon w="30" h="30" fill={pathname === '/shop' ? "#1E71F2" : "#8E8E93"} />
                        </div>
                        <p className={`${pathname === '/shop' ? "text-brandprimary" : "text-sidebaricon"} text-center text-[14px] mt-[7px] font-sans`}>
                            Shopping
                        </p>
                    </div>
                </Link>

                <Link href="/news">
                    <div className="mb-[34px]">
                        <div className="w-[29px] mx-auto">
                            <FeedIcon w="30" h="30" fill={pathname === '/news' ? "#1E71F2" : "#8E8E93"} />
                        </div>
                        <p className={`${pathname === '/news' ? "text-brandprimary" : "text-sidebaricon"} text-center text-[14px] mt-[7px] font-sans`}>
                            News
                        </p>
                    </div>
                </Link>

                <div className="mb-[34px]">
                    <div className="w-[29px] mx-auto">
                        <FeedIcon w="30" h="30" fill={pathname === '/star' ? "#1E71F2" : "#8E8E93"} />
                    </div>
                    <p className={`${pathname === '/news' ? "text-brandprimary" : "text-sidebaricon"} text-center text-[14px] mt-[7px] font-sans`}>
                            Star Icon
                        </p>
                </div>
            </div>
        </div>
    );
}

export default Rightsidebar;
