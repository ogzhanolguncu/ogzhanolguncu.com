import React, { ReactChild } from 'react';
import {
  ChakraProvider,
  cookieStorageManager,
  localStorageManager,
  useColorMode,
} from '@chakra-ui/react';
import { Global, css } from '@emotion/react';
import { NextApiRequest } from 'next';

import { prismLightTheme, prismDarkTheme } from 'styles/prism';
import theme from 'styles/theme';

type Props = {
  cookies: unknown;
  children: ReactChild;
};

const GlobalStyle = ({ children }: { children: ReactChild }) => {
  const { colorMode } = useColorMode();

  return (
    <>
      <Global
        styles={css`
          ${colorMode === 'light' ? prismLightTheme : prismDarkTheme};
          ::selection {
            background-color: rgb(87, 62, 222);
            color: #fefefe;
          }
          html {
            min-width: 360px;
            scroll-behavior: smooth;
          }
          #__next {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            background: ${colorMode === 'light' ? 'white' : '#171923'};
          }
          @font-face {
            font-family: 'Avenir-Roman';
            src: url('/fonts/Avenir-Roman.woff2') format('woff2');
            font-style: medium;
            font-weight: 500;
            font-display: swap;
            unicode-range: U+0020-007F, U+0100-017F;
          }
        `}
      />
      {children}
    </>
  );
};

export const Chakra = ({ cookies, children }: Props) => {
  // b) Pass `colorModeManager` prop
  const colorModeManager =
    typeof cookies === 'string' ? cookieStorageManager(cookies) : localStorageManager;

  return (
    <ChakraProvider theme={theme} colorModeManager={colorModeManager}>
      <GlobalStyle>{children}</GlobalStyle>
    </ChakraProvider>
  );
};

// also export a reusable function getServerSideProps
export function getServerSideProps(req: NextApiRequest) {
  return {
    props: {
      // first time users will not have any cookies and you may not return
      // undefined here, hence ?? is necessary
      cookies: req.headers.cookie ?? '',
    },
  };
}
