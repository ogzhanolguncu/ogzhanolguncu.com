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

export function useUser({ redirectTo = '', redirectIfFound = false } = {}) {
  const { data } = useSWR('http://localhost:3001/auth/profile', fetcher);
  const user = data?.success;
  const finished = Boolean(data);
  const hasUser = Boolean(user);

  useEffect(() => {
    if (!redirectTo || !finished) return;
    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !hasUser) ||
      // If redirectIfFound is also set, redirect if the user was found.
      (redirectIfFound && hasUser)
    ) {
      Router.push(redirectTo);
    }
  }, [redirectTo, redirectIfFound, finished, hasUser]);

  return data?.statusCode === 401 ? null : user;
}
