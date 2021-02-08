import Document, { Html, Head, Main, NextScript } from 'next/document';

import React from 'react';

import { ColorModeScript } from '@chakra-ui/react';
import { GoogleFont } from '@components/index';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <script defer src="https://www.googletagmanager.com/gtag/js?id=G-T9GGC8MHKK"></script>
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
          {/* <link rel="preconnect" href="https://fonts.gstatic.com" /> */}
          <link
            href="/fonts/Avenir-Roman.woff2"
            as="font"
            type="font/woff2"
            rel="preload"
            crossOrigin="anonymous"
          />
          <GoogleFont href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
          {/* <link
            media="print"
            onLoad={() => 'this.onload=null;this.removeAttribute("media");'}
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          /> */}
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
          <ColorModeScript />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
