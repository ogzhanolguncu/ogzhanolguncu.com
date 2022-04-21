import Document, { Html, Head, Main, NextScript } from 'next/document';

import React from 'react';
class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="ananoymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Cabin:wght@400;500;700&display=swap"
            rel="preload"
            as="style"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Cabin:wght@400;500;700&display=swap"
            rel="stylesheet"
            media="print"
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
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
