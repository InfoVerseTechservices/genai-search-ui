'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { getCookie } from '@/lib/cookies';
import axios from 'axios';

const ROOT_URL_AUTH = 'https://caiuserservice-1-dev-dot-fair-myth-398920.uc.r.appspot.com';

const UserProfileContext = createContext<any>(null);

export default function UserProfileContextProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [userDetails, setUserDetails] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const [loadings, setLoadings] = useState({
    userDetails: false,
  });

  useEffect(() => {
    getUserDetails();
  }, []);

  const getUserDetails = async () => {
    try {
      setLoadings((prev) => ({ ...prev, userDetails: true }));
      const token = getCookie('token');
      
      if (!token) {
        setIsLoggedIn(false);
        setIsReady(true);
        return;
      }

      const res = await axios.get(`${ROOT_URL_AUTH}/user/`, {
        headers: {
          Authorization: token,
        },
      });

      setUserDetails(res.data);
      setIsLoggedIn(true);
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
      value={{ userDetails, isLoggedIn, loadings, getUserDetails }}
    >
      {isReady && children}
    </UserProfileContext.Provider>
  );
}

export const useUserProfile = () => {
  return useContext(UserProfileContext);
};