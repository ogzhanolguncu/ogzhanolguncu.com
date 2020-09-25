import { AppProps } from 'next/app';
import { ThemeProvider, CSSReset, ColorModeProvider } from '@chakra-ui/core';
import theme from 'styles/theme';
import { AuthProvider } from '@contexts/AuthContext';
import { CustomColorModeProvider } from '@contexts/CustomColorContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <ColorModeProvider value="light">
        <CustomColorModeProvider>
          <AuthProvider>
            <CSSReset />
            <Component {...pageProps} />
          </AuthProvider>
        </CustomColorModeProvider>
      </ColorModeProvider>
    </ThemeProvider>
  );
}

export default MyApp;
