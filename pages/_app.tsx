import { AppProps } from 'next/app';
import { ThemeProvider, CSSReset, ColorModeProvider, useColorMode } from '@chakra-ui/core';
import theme from 'styles/theme';
import { CustomColorModeProvider } from '@contexts/CustomColorContext';
import { MDXProvider } from '@mdx-js/react';
import MDXComponents from '@components/MDXComponents';
import { prismLightTheme, prismDarkTheme } from '../styles/prism';
import { Global, css } from '@emotion/core';
import { ReactNode } from 'react';
import { DefaultSeo } from 'next-seo';
import SEO from 'next-seo.config';

type Prop = {
  children: ReactNode;
};

const GlobalStyle = ({ children }: Prop) => {
  const { colorMode } = useColorMode();

  return (
    <>
      <CSSReset />
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
          h6 {
            font-family: 'Playfair Display', serif;
            font-weight: 700;
          }
        `}
      />
      {children}
    </>
  );
};
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <ColorModeProvider value={'light'}>
        <GlobalStyle>
          <CustomColorModeProvider>
            <MDXProvider components={MDXComponents}>
              <DefaultSeo {...SEO} />
              <Component {...pageProps} />
            </MDXProvider>
          </CustomColorModeProvider>
        </GlobalStyle>
      </ColorModeProvider>
    </ThemeProvider>
  );
}

export default MyApp;
