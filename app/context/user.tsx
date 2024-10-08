'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { getCookie } from '@/components/LeftSidebar/cookies';
import { ROOT_URL_AUTH } from '@/components/LeftSidebar/rootURL';
import axios from 'axios';

// Create the context
const UserProfileContext = createContext<any>(null);

export default function UserProfileContextProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [userDetails, setUserDetails] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // to check if the user is logged in
  const [page, setPage] = useState(1);
  const [isReady, setIsReady] = useState(false);

  const [loadings, setLoadings] = useState({
    userDetails: false,
    getPost: false,
    editProfile: false,
    getFollowers: false,
  });

  useEffect(() => {
    getUserDetails();
  }, []);

  const getUserDetails = async () => {
    try {
      setLoadings((prev) => ({ ...prev, userDetails: true }));
      const res = await axios.get(`${ROOT_URL_AUTH}/user/`, {
        headers: {
          Authorization: getCookie('token'),
        },
      });

      await setUserDetails(res.data);
      await setIsLoggedIn(true);
    } catch (err) {
      console.log(err);
      setIsLoggedIn(false);
    } finally {
      setLoadings((prev) => ({ ...prev, userDetails: false }));
      setIsReady(true);
    }
  };

  return (
    <UserProfileContext.Provider
      value={{ userDetails, isLoggedIn, loadings, page, setPage }}
    >
      {isReady && children}
    </UserProfileContext.Provider>
  );
}

// Custom hook to use the context in other components
export const useUserProfile = () => {
  return useContext(UserProfileContext);
};
