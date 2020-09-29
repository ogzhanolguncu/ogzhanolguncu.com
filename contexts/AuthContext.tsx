import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useRouter } from 'next/router';

import Cookies from 'js-cookie';
import api from 'api';

type Props = {
  children?: ReactNode;
};

type ResponseType = {
  jwtToken: string;
  userName: string;
};

type ProviderType = {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  errorMessage?: string;
  setErrorMessage: React.Dispatch<React.SetStateAction<undefined>>;
};

const AuthContext = createContext({} as ProviderType);

export const AuthProvider = ({ children }: Props) => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState(undefined);
  const login = async (userName: string, password: string) => {
    try {
      const {
        data: { jwtToken: token },
      } = await api.post<ResponseType>('auth/login', { userName, password });

      if (token) {
        Cookies.set('token', token, { expires: 60 });
        api.defaults.headers.Authorization = `Bearer ${token}`;
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error =>', error);
    }
  };

  const logout = () => {
    Cookies.remove('token');
    router.push('/dashboard');
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        errorMessage,
        setErrorMessage,
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
