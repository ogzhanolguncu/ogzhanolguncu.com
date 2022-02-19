import { extendTheme, theme as chakraTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    body: `Inter, -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"`,
    heading: `Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"`,
  },
  fontWeights: {
    normal: 400,
    medium: 600,
    bold: 700,
  },
  colors: {
    blue: {
      ...chakraTheme.colors.blue,
      '500': '#4C6EF5',
    },
  },
});

export default theme;
