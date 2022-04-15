import { AppProps } from 'next/app';
import { MDXProvider } from '@mdx-js/react';
import MDXComponents from '@components/MDXComponents';
import React from 'react';
import { DefaultSeo } from 'next-seo';
import SEO from 'next-seo.config';
import { Chakra } from '@components/Chakra';
import { CustomColorModeProvider } from '@contexts/CustomColorContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Chakra cookies={pageProps.cookies}>
      <MDXProvider components={MDXComponents}>
        <CustomColorModeProvider>
          <DefaultSeo {...SEO} />
          <Component {...pageProps} />
        </CustomColorModeProvider>
      </MDXProvider>
    </Chakra>
  );
}

export default MyApp;
