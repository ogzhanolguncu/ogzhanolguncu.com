import { useEffect } from 'react';
import Router from 'next/router';
import useSWR from 'swr';
import Cookies from 'js-cookie';

const token = Cookies.get('token');
const myHeaders = new Headers({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

const fetcher = (url: string) =>
  fetch(url, {
    headers: myHeaders,
  })
    .then((r) => r.json())
    .then((data) => {
      return data;
    });

export default function useUser({ redirectTo = '' } = {}) {
  const { data: user, error } = useSWR('http://localhost:3001/auth/profile', fetcher);
  const loading = user === undefined;

  // handle redirections
  useEffect(() => {
    if (!redirectTo || loading) return;

    if (redirectTo && !user) {
      localStorage.setItem('_bRedirectTo', Router.route);
      Router.push(redirectTo);
    }
  }, [redirectTo, user, loading]);

  return {
    user,
    loading,
    error,
  };
}
