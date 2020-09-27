import { NextComponentType, NextPageContext } from 'next';
import cookies from 'next-cookies';
import Router from 'next/router';
import React from 'react';
import api from 'api';
import Error from 'pages/_error';
import { ErrorProps } from 'global';

const redirectBasedOnLogin = async (
  ctx: NextPageContext,
  route: string,
  redirectIfAuthed: boolean,
) => {
  const { token } = cookies(ctx);
  api.defaults.headers.Authorization = `Bearer ${token}`;
  const isLoggedIn = await api.get('auth/profile');
  const shouldRedirect = redirectIfAuthed ? isLoggedIn : !isLoggedIn;

  if (shouldRedirect) {
    if (ctx.res) {
      ctx.res.writeHead(302, {
        Location: route,
      });
      ctx.res.end();
    } else {
      Router.push(route);
    }
    return Promise.resolve(false);
  }
  return Promise.resolve(true);
};

const withAuthRedirect = (route: string, redirectIfAuthed: boolean) => (
  Page: NextComponentType<NextPageContext, ErrorProps>,
) => {
  return class extends React.Component<ErrorProps> {
    static async getInitialProps(ctx: NextPageContext) {
      try {
        const shouldContinue = await redirectBasedOnLogin(ctx, route, redirectIfAuthed);
        if (!shouldContinue) return {};
        if (Page.getInitialProps) return Page.getInitialProps(ctx);
        return { shouldContinue };
      } catch (error) {
        return { statusCode: 401, message: 'Oopsie Whoopsiee' };
      }
    }

    render() {
      const { statusCode } = this.props;
      if (statusCode) return <Error />;
      return <Page {...this.props} />;
    }
  };
};

/**
 * HOC that redirects to login page if the user is not logged in.
 */
export const withLoginRedirect = withAuthRedirect('/login', false);

/**
 * HOC that redirects to the dashboard if the user is logged in.
 */
export const withDashboardRedirect = withAuthRedirect('/dashboard', true);
