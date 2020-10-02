import { AppProps } from 'next/app';
import { ThemeProvider, CSSReset, ColorModeProvider } from '@chakra-ui/core';
import theme from 'styles/theme';
import { AuthProvider } from '@contexts/AuthContext';
import { CustomColorModeProvider } from '@contexts/CustomColorContext';
import { MDXProvider } from '@mdx-js/react';
import MDXComponents from '@components/MDXComponents';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <MDXProvider components={MDXComponents}>
        <ColorModeProvider value="light">
          <CustomColorModeProvider>
            <AuthProvider>
              <CSSReset />
              <Component {...pageProps} />
            </AuthProvider>
          </CustomColorModeProvider>
        </ColorModeProvider>
      </MDXProvider>
    </ThemeProvider>
  );
}

export default MyApp;
