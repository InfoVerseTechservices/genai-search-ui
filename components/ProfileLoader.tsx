"use client"
import React, { useEffect, useState, FunctionComponent as FC } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUserProfile } from '@/app/context/user';
import ProfilePicture from '@/components/LeftSidebar/ProfilePicture';
import Dropdown from './LeftSidebar/Dropdown'
import Link from 'next/link';
const ProfileLoader: FC = () => {
    const [profilePic, setProfilePic] = useState<string | undefined>(undefined);
    const router = useRouter();
    const [name, setName] = useState("")
  
    const { userDetails, isLoggedIn } = useUserProfile();
  
    useEffect(() => {
      // Don't use it on the sidebar - since the sidebar is present on login as well - infinite loop
      // if (!isLoggedIn) {
      //   router.push('/login');
      //   return;
      // }
  
      if (isLoggedIn) {
        setName(userDetails.name || "Name Here")
        setProfilePic(userDetails.profile_picture || undefined);
      } // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn, userDetails.name, userDetails.profile_picture]);
  
    const handleSignOut = () => {
      localStorage.removeItem('profilePic');
      router.push('/sign-up');
    };
  
    return (
     <>
     <Dropdown
    offset={[0, 10]}
    placement="bottom-start"
    btnClassName="flex z-[150] justify-center items-center rounded-full hover:text-brandprimary cursor-pointer mx-auto"
    button={<ProfilePicture  image={profilePic} />}
>
    <ul className="min-w-[160px] rounded-lg bg-white shadow-md">

      {/* user name to be imported here */}
        <Link href="/profile"><li className="px-4 py-2 hover:bg-gray-100 cursor-pointer  text-brandprimary">{name}</li></Link>
        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer " onClick={handleSignOut}>Log out</li>
    </ul>
</Dropdown>
     </>
    );
  };
  
  export default ProfileLoader;
  