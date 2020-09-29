import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';

import Cookies from 'js-cookie';
import api from 'api';

type Props = {
  children?: ReactNode;
};

type UserType = {
  user?: string;
};

type ResponseType = {
  jwtToken: string;
  userName: string;
};

type ProviderType = {
  isAuthenticated: boolean;
  user: UserType;
  login: (email: string, password: string) => Promise<void>;
  loading: boolean;
  logout: () => void;
  errorMessage?: string;
  setErrorMessage: React.Dispatch<React.SetStateAction<undefined>>;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

const AuthContext = createContext({} as ProviderType);

export const AuthProvider = ({ children }: Props) => {
  const router = useRouter();
  const [user, setUser] = useState({} as UserType); // If we supply inital value as types we specify as  ||| {} as Type |||
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function loadUserFromCookies() {
      const token = Cookies.get('token');
      if (token) {
        api.defaults.headers.Authorization = `Bearer ${token}`;
      }
      setLoading(false);
    }
    loadUserFromCookies();
  }, []);

  const login = async (userName: string, password: string) => {
    try {
      const {
        data: { jwtToken: token, userName: user },
      } = await api.post<ResponseType>('auth/login', { userName, password });
      if (token) {
        Cookies.set('token', token, { expires: 60 });
        api.defaults.headers.Authorization = `Bearer ${token}`;

        setIsAuthenticated(true);
        setUser({ user });

        router.push('dashboard');
      }
    } catch (error) {
      if (error.response?.data) {
        setErrorMessage(error.response?.data?.message);
      }
    }
  };

  const logout = () => {
    Cookies.remove('token');

    setUser({});
    setIsAuthenticated(false);

    window.location.pathname = '/dashboard/login';
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        loading,
        logout,
        errorMessage,
        setErrorMessage,
        setIsAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default function useAuth() {
  const context = useContext(AuthContext);

  return context;
}
