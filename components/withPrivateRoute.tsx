import React from 'react';
import Router from 'next/router';
import api from 'api';
import cookies from 'next-cookies';
import Deneme from './deneme';

const login = '/login'; // Define your login route address.

const withPrivateRoute = (WrappedComponent: any) => {
  const hocComponent = ({ ...props }) => {
    if (props.error) return <Deneme />;
    return <WrappedComponent {...props} />;
  };

  hocComponent.getInitialProps = async (ctx: any) => {
    try {
      const { token } = cookies(ctx);
      const userAuth = { auth: false };
      api.defaults.headers.Authorization = `Bearer ${token}`;
      const res = await api.get('auth/profile');
      if (res.status === 200) userAuth.auth = true;
      // Are you an authorized user or not?
      if (!userAuth?.auth) {
        // Handle server-side and client-side rendering.
        if (res) {
          ctx.res?.writeHead(302, {
            Location: login,
          });
          ctx.res?.end();
        } else {
          Router.replace(login);
        }
      } else if (WrappedComponent.getInitialProps) {
        const wrappedProps = await WrappedComponent.getInitialProps(userAuth);
        return { ...wrappedProps, userAuth };
      }

      return { userAuth };
    } catch (error) {
      return { error: true, denemeSikis: error.response.status };
    }
  };

  return hocComponent;
};

export default withPrivateRoute;
