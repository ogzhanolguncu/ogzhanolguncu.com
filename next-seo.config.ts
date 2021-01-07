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
        url: '/static/images/debounce-and-throttle-comprehensive-guide/02.png',
        alt: title,
        width: 1200,
        height: 800,
      },
    ],
  },
};

export default SEO;
