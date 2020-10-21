const title = 'Oğuzhan Olguncu – Developer, writer, creator.';
const description = 'Front-end developer, JavaScript enthusiast, and course creator.';

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
        url: '/static/favicons/favicon.ico',
        alt: title,
        width: 1280,
        height: 720,
      },
    ],
  },
};

export default SEO;
