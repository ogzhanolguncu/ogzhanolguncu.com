import { AppProps } from 'next/app';
import { CustomColorModeProvider } from '@contexts/CustomColorContext';
import { MDXProvider } from '@mdx-js/react';
import MDXComponents from '@components/MDXComponents';
import React from 'react';
import { DefaultSeo } from 'next-seo';
import SEO from 'next-seo.config';
import { Chakra } from '@components/Chakra';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Chakra cookies={pageProps.cookies}>
      <CustomColorModeProvider>
        <MDXProvider components={MDXComponents}>
          <DefaultSeo {...SEO} />
          <Component {...pageProps} />
        </MDXProvider>
      </CustomColorModeProvider>
    </Chakra>
  );
}

export default MyApp;
