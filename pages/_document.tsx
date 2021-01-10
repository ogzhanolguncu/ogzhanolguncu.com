import { ColorModeScript } from '@chakra-ui/react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import React from 'react';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-T9GGC8MHKK"></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-T9GGC8MHKK');
        `,
            }}
          />
          <link
            rel="alternate"
            type="application/rss+xml"
            title="RSS feed for blog posts"
            href="https://ogzhanolguncu.com/rss.xml"
          />
          <link
            rel="stylesheet"
            href="https://assets.vercel.com/raw/upload/v1587415301/fonts/2/inter-var-latin.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap"
            rel="stylesheet"
          />
          <link href="/static/favicons/favicon.ico" rel="shortcut icon" />
          <link
            href="/static/favicons/favicon-32x32.png"
            rel="icon"
            sizes="32x32"
            type="image/png"
          />
          <link
            href="/static/favicons/favicon-16x16.png"
            rel="icon"
            sizes="16x16"
            type="image/png"
          />
        </Head>
        <body>
          <ColorModeScript initialColorMode="light" />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
