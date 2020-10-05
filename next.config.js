const readingTime = require('reading-time');
const mdxPrism = require('mdx-prism');
const withMdxEnhanced = require('next-mdx-enhanced');
const withImages = require('next-images');

module.exports = withImages(
  withMdxEnhanced({
    layoutPath: 'layouts',
    defaultLayout: true,
    remarkPlugins: [
      require('remark-autolink-headings'),
      require('remark-slug'),
      require('remark-code-titles'),
    ],
    rehypePlugins: [mdxPrism],
    extendFrontMatter: {
      process: (mdxContent) => ({
        wordCount: mdxContent.split(/\s+/gu).length,
        readingTime: readingTime(mdxContent),
      }),
    },
  })({
    webpack: (config) => {
      return config;
    },
  }),
);

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/
});

module.exports = withMDX({
  pageExtensions: ['js', 'jsx', 'md', 'mdx']
});