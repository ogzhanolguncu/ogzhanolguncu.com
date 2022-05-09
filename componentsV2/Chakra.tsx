import React, { ReactChild } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { Global, css } from '@emotion/react';

import { prismLightTheme } from 'styles/prism';
import theme from 'styles/theme';

type Props = {
  children: ReactChild;
};

const GlobalStyle = ({ children }: { children: ReactChild }) => {
  return (
    <>
      <Global
        styles={css`
          ${prismLightTheme};
          ::selection {
            background-color: rgb(87, 62, 222);
            color: #fefefe;
          }
          html {
            min-width: 360px;
            scroll-behavior: smooth;
            color: '#1A202C';
          }
          #__next {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            background-color: #101010;
            color: '#1A202C';
          }
        `}
      />
      {children}
    </>
  );
};

export const Chakra = ({ children }: Props) => {
  return (
    <ChakraProvider theme={theme}>
      <GlobalStyle>{children}</GlobalStyle>
    </ChakraProvider>
  );
};
