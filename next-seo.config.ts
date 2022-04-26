const title = 'Oğuzhan Olguncu – Engineer, mentor, blogger.';
const description =
  'A developer who likes to hack things up. Dedicated learner, mentor and technical blogger - Oğuzhan Olguncu';

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
        url: '/static/images/function-composition-javascript/pillars.webp',
        alt: title,
        width: 1200,
        height: 800,
      },
    ],
  },
};

export default SEO;
