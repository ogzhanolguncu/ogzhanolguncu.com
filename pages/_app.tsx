import { AppProps } from 'next/app';
import { ThemeProvider, CSSReset, ColorModeProvider } from '@chakra-ui/core';
import theme from 'styles/theme';
import { CustomColorModeProvider } from 'contexts/CustomColorContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <ColorModeProvider value="light">
        <CustomColorModeProvider>
          <CSSReset />
          <Component {...pageProps} />
        </CustomColorModeProvider>
      </ColorModeProvider>
    </ThemeProvider>
  );
}

export default MyApp;
