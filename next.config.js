const withImages = require('next-images');
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
});

module.exports = withMDX(
  withImages({
    pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    webpack(config, options) {
      return config;
    },
  }),
);
