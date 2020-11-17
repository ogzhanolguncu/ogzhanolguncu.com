const title = 'Oğuzhan Olguncu – Developer, writer, dedicated learner.';
const description =
  'A developer who likes to focus on building beautiful UI/UX designs. Loves using Typescript - Oğuzhan Olguncu';

const SEO = {
  title,
  description,
  canonical: 'https://ogzhanolguncu.com/',
  openGraph: {
    type: 'website',
    locale: 'en_IE',
    url: 'https://ogzhanolguncu.com/',
    title,
    description,
    images: [
      {
        url: 'https://ogzhanolguncu.com/static/favicons/favicon.ico',
        alt: title,
        width: 1280,
        height: 720,
      },
    ],
  },
};

export default SEO;
