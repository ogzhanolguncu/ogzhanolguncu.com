import React from 'react';
import Head from 'next/head';

type Props = {
  redirectTo: string;
  redirectOnUser?: boolean;
};

const Redirect = (props: Props) => {
  return (
    <>
      <Head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            if (document.cookie && document.cookie.indexOf("token") ${
              props.redirectOnUser ? '> -1' : '< 0'
            }) {
                if (document.location.pathname !== "/home") {
                    window.location.href = "${props.redirectTo}";
                }
            }
        `,
          }}
        />
      </Head>
      <style global jsx>{`
        body {
          display: ${typeof window !== `undefined` &&
          props.redirectOnUser &&
          document.cookie.includes('token') &&
          location.pathname !== '/home'
            ? 'none'
            : 'block'};
        }
      `}</style>
    </>
  );
};

export default Redirect;
