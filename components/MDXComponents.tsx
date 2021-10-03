/* eslint-disable @typescript-eslint/no-explicit-any*/

import {
  Box,
  Alert,
  Code,
  Heading,
  Kbd,
  Link,
  Text,
  Divider,
  useColorMode,
  chakra,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import CodeSandBox from './CodeSandBox';

const Table = (props: any) => (
  <Box overflowX="scroll" w="full">
    <Box as="table" textAlign="left" mt="32px" w="full" {...props} />
  </Box>
);

const THead = (props: any) => {
  const { colorMode } = useColorMode();
  const bg = {
    light: 'gray.50',
    dark: 'whiteAlpha.100',
  };

  return <Box as="th" bg={bg[colorMode]} fontWeight="semibold" p={2} fontSize="sm" {...props} />;
};

const TData = (props: any) => (
  <Box
    as="td"
    p={2}
    borderTopWidth="1px"
    borderColor="inherit"
    fontSize="sm"
    whiteSpace="normal"
    {...props}
  />
);

const TImage = (props: any) => <chakra.img shadow="md" borderRadius="16px" {...props} />;

const CustomLink = (props: any) => {
  const { colorMode } = useColorMode();
  const color = {
    light: 'hsl(208, 99%, 44%)',
    dark: 'hsl(208, 95%, 68%)',
  };

  const href = props.href;
  const isInternalLink = href && (href.startsWith('/') || href.startsWith('#'));

  if (isInternalLink) {
    return (
      <NextLink href={href} passHref>
        <Link color={color[colorMode]} {...props} />
      </NextLink>
    );
  }

  return <Link color={color[colorMode]} isExternal {...props} />;
};

const Quote = (props: any) => {
  const { colorMode } = useColorMode();
  const bgColor = {
    light: 'blue.50',
    dark: 'blue.900',
  };

  return (
    <Alert
      mt={4}
      w="98%"
      bg={bgColor[colorMode]}
      variant="left-accent"
      status="info"
      css={{
        '> *:first-of-type': {
          marginTop: 0,
          marginLeft: 8,
        },
      }}
      {...props}
    />
  );
};

const DocsHeading = (props: any) => (
  <Heading
    css={{
      scrollMarginTop: '100px',
      scrollSnapMargin: '100px', // Safari
      '&[id]': {
        pointerEvents: 'none',
      },
      '&[id]:before': {
        display: 'block',
        height: ' 6rem',
        marginTop: '-6rem',
        visibility: 'hidden',
        content: `""`,
      },
      '&[id]:hover a': { opacity: 1 },
    }}
    {...props}
    mb="1em"
    mt="2em"
  >
    <Box pointerEvents="auto">
      {props.children}
      {props.id && (
        <NextLink href={`#${props.id}`}>
          <chakra.a
            aria-label="anchor"
            color="transparent"
            fontWeight="normal"
            outline="none"
            _hover={{ cursor: 'pointer', color: 'rgb(76, 110, 245, 0.8)' }}
            _focus={{ opacity: 1, boxShadow: 'outline' }}
            ml="0.375rem"
          >
            #
          </chakra.a>
        </NextLink>
      )}
    </Box>
  </Heading>
);

const Hr = () => {
  const { colorMode } = useColorMode();
  const borderColor = {
    light: 'gray.200',
    dark: 'gray.600',
  };

  return <Divider borderColor={borderColor[colorMode]} my={4} w="100%" />;
};

const Tstrong = (props: any) => {
  const { colorMode } = useColorMode();
  const textColor = {
    light: '#1A202C',
    dark: 'rgb(221, 107, 32)',
  };

  return <Text as="strong" color={textColor[colorMode]} {...props} />;
};

const Tparagraph = (props: any) => {
  const { colorMode } = useColorMode();

  return (
    <Text
      as="p"
      mt={4}
      fontSize="17.5px"
      lineHeight="1.7"
      fontWeight={colorMode === 'light' ? '500' : 'normal'}
      {...props}
    />
  );
};

const MDXComponents = {
  h1: (props: any) => <Heading as="h1" size="xl" my={4} {...props} />,
  h2: (props: any) => <DocsHeading as="h2" fontWeight="bold" size="lg" {...props} />,
  h3: (props: any) => <DocsHeading as="h3" size="md" fontWeight="bold" {...props} />,
  inlineCode: (props: any) => (
    <Code colorScheme="yellow" fontSize={['0.45em', '0.55em', '0.60em', '0.84em']} {...props} />
  ),
  kbd: Kbd,
  br: (props: any) => <Box height="24px" {...props} />,
  hr: Hr,
  table: Table,
  th: THead,
  td: TData,
  a: CustomLink,
  img: TImage,
  p: Tparagraph,
  ul: (props: any) => <Box as="ul" pt={2} fontSize="17.5px" pl={4} ml={2} {...props} />,
  ol: (props: any) => <Box as="ol" pt={2} fontSize="17.5px" pl={4} ml={2} {...props} />,
  li: (props: any) => <Box as="li" pb={1} fontSize="17.5px" {...props} />,
  strong: Tstrong,
  CodeSandBox,
  blockquote: Quote,
};

export { CustomLink };
export default MDXComponents;
