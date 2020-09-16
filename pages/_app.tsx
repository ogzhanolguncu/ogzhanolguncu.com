import { AppProps } from 'next/app';
import { ThemeProvider, CSSReset, ColorModeProvider } from '@chakra-ui/core';
import theme from 'styles/theme';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <ColorModeProvider value="light">
        <CSSReset />
        <Component {...pageProps} />
      </ColorModeProvider>
    </ThemeProvider>
  );
}

export default MyApp;
