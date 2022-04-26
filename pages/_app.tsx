import { AppProps } from 'next/app';
import { MDXProvider } from '@mdx-js/react';
import MDXComponents from 'componentsV2/MDXComponents';
import React from 'react';
import { DefaultSeo } from 'next-seo';
import SEO from 'next-seo.config';
import Script from 'next/script';
import { Chakra } from 'componentsV2/Chakra';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-T9GGC8MHKK" strategy="worker" />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-T9GGC8MHKK');
        `,
        }}
      />
      <Chakra>
        <MDXProvider components={MDXComponents}>
          <DefaultSeo {...SEO} />
          <Component {...pageProps} />
        </MDXProvider>
      </Chakra>
    </>
  );
}

export default MyApp;
