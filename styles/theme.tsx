import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    body: `Cabin, serif`,
    heading: `Cabin, serif`,
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    bold: 700,
  },
  colors: {
    siteBg: '#101010',
    codeColor: '#fd955acc',
    whiteAlpha: {
      900: '#000',
    },
  },
});

export default theme;
