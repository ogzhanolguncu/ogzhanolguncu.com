import { AppProps } from 'next/app';
import { ThemeProvider, CSSReset, ColorModeProvider, useColorMode } from '@chakra-ui/core';
import theme from 'styles/theme';
import { AuthProvider } from '@contexts/AuthContext';
import { CustomColorModeProvider } from '@contexts/CustomColorContext';
import { MDXProvider } from '@mdx-js/react';
import MDXComponents from '@components/MDXComponents';
import { prismLightTheme, prismDarkTheme } from '../styles/prism';
import { Global, css } from '@emotion/core';
import { ReactNode } from 'react';

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
            background-color: #47a3f3;
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
        `}
      />
      {children}
    </>
  );
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <ColorModeProvider value="light">
        <GlobalStyle>
          <CustomColorModeProvider>
            <AuthProvider>
              <MDXProvider components={MDXComponents}>
                <Component {...pageProps} />
              </MDXProvider>
            </AuthProvider>
          </CustomColorModeProvider>
        </GlobalStyle>
      </ColorModeProvider>
    </ThemeProvider>
  );
}

export default MyApp;
