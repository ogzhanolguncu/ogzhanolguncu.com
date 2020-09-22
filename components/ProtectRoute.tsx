import useAuth from '@contexts/AuthContext';
import { ComponentType } from 'react';

export function ProtectRoute(Component: ComponentType) {
  return () => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) return <Component />;
    return 'Unauthorized';
  };
}

//TODO https://github.com/piglovesyou/nextjs-passport-oauth-example/blob/9d7119368d5624bd638d3e83fc26b9f3a0bdbfa5/lib/withIdentity.tsx#L23
//TODO https://github.com/vercel/next.js/discussions/10925
