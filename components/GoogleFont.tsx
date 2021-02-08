import * as React from 'react';
import Head from 'next/head';

export type GoogleFontsProps = {
  href: string;
};

let hydrated = false;

const GoogleFont = ({ href }: GoogleFontsProps) => {
  const hydratedRef = React.useRef(false);
  const [, rerender] = React.useState(false);

  React.useEffect(() => {
    if (!hydratedRef.current) {
      hydrated = true;
      hydratedRef.current = true;
      rerender(true);
    }
  }, []);

  return (
    <Head>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preload" as="style" href={href} />
      <link href={href} rel="stylesheet" media={!hydrated ? 'print' : 'all'} />
    </Head>
  );
};

export default GoogleFont;
