import { AppProps } from 'next/app';
import { useColorMode } from '@chakra-ui/react';
import theme from 'styles/theme';
import { CustomColorModeProvider } from '@contexts/CustomColorContext';
import { MDXProvider } from '@mdx-js/react';
import MDXComponents from '@components/MDXComponents';
import { prismLightTheme, prismDarkTheme } from '../styles/prism';
import { Global, css } from '@emotion/react';
import React, { ReactNode } from 'react';
import { DefaultSeo } from 'next-seo';
import SEO from 'next-seo.config';
import { ChakraProvider } from '@chakra-ui/react';
import 'components/time.css';

type Prop = {
  children: ReactNode;
};

const GlobalStyle = ({ children }: Prop) => {
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
            src: url('/fonts/Avenir-Roman.ttf');
            font-display: swap;
          }
        `}
      />
      {children}
    </>
  );
};
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <GlobalStyle>
        <CustomColorModeProvider>
          <MDXProvider components={MDXComponents}>
            <DefaultSeo {...SEO} />
            <Component {...pageProps} />
          </MDXProvider>
        </CustomColorModeProvider>
      </GlobalStyle>
    </ChakraProvider>
  );
}

export default MyApp;
