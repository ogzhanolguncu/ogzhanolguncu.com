const title = 'Oğuzhan Olguncu – Developer, writer, creator.';
const description = 'Front-end developer, JavaScript enthusiast, and course creator.';

const SEO = {
  title,
  description,
  canonical: 'https://personal-blog-client.vercel.app/',
  openGraph: {
    type: 'website',
    locale: 'en_IE',
    url: 'https://personal-blog-client.vercel.app/',
    title,
    description,
    images: [
      {
        url: 'https://personal-blog-client.vercel.app/',
        alt: title,
        width: 1280,
        height: 720,
      },
    ],
  },
};

export default SEO;
