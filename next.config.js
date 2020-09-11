const withImages = require('next-images');
module.exports = withImages({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  webpack(config, options) {
    return config;
  },
});
