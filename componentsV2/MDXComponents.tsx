import { Box, Alert, Code, Heading, Kbd, Link, Text, Divider, chakra } from '@chakra-ui/react';
import NextLink from 'next/link';

import CodeSandBox from './CodeSandBox';
import EventBubbling from './BlogExampleComponents/EventPropagationExample/Bubbling';
import EventCapturing from './BlogExampleComponents/EventPropagationExample/Capturing';
import AsyncWithtHook from './BlogExampleComponents/CustomHookExample/AsyncWithHook';
import ToggleWithHook from './BlogExampleComponents/CustomHookExample/AsyncWithoutHook';
import CounterExample from './BlogExampleComponents/PrevState/CounterExample';
import CounterPrevExample from './BlogExampleComponents/PrevState/CounterPrevExample';

const Table = (props: any) => (
  <Box overflowX="scroll" w="full">
    <Box as="table" textAlign="left" mt="32px" w="full" {...props} />
  </Box>
);

const THead = (props: any) => {
  return <Box as="th" fontWeight="semibold" p={2} fontSize="sm" {...props} />;
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

const TImage = (props: any) => (
  <chakra.img boxShadow="6px 6px #80808082" borderRadius="16px" {...props} />
);

const CustomLink = (props: any) => {
  const href = props.href;
  const isInternalLink = href && (href.startsWith('/') || href.startsWith('#'));

  if (isInternalLink) {
    return (
      <NextLink href={href} passHref>
        <Link {...props} />
      </NextLink>
    );
  }

  return <Link isExternal {...props} color="blue.500" textDecoration="underline" />;
};

const Quote = (props: any) => {
  return (
    <Alert
      mt={4}
      textColor='gray.800'
      w="98%"
      bg="white.800"
      boxShadow="8px 8px #8080805e"
      borderRadius="10px"
      backgroundImage="linear-gradient(45deg, var(--chakra-colors-pink-100) 0%, var(--chakra-colors-yellow-300) 100%)"
      variant="solid"
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
  return <Divider my={4} w="100%" borderColor="#000" />;
};

const Tparagraph = (props: any) => {
  return (
    <Text
      as="p"
      mt={4}
      fontSize="19px"
      lineHeight="1.7"
      css={{
        wordSpacing: '1.2px',
        letterSpacing: '0.1px',
      }}
      fontWeight={500}
      {...props}
    />
  );
};

const Tstrong = (props: any) => <Text as="span" fontWeight="bold" {...props} />;
const MDXComponents = {
  h1: (props: any) => <Heading as="h1" size="xl" my={4} {...props} />,
  h2: (props: any) => (
    <DocsHeading as="h2" fontSize="35px"  fontWeight="bold"  {...props} />
  ),
  h3: (props: any) => <DocsHeading as="h3" fontSize="25px" fontWeight="bold" {...props} />,
  inlineCode: (props: any) => <Code color="white" backgroundColor="black" {...props} />,
  kbd: Kbd,
  br: (props: any) => <Box height="24px" {...props} />,
  hr: Hr,
  table: Table,
  th: THead,
  td: TData,
  a: CustomLink,
  img: TImage,
  p: Tparagraph,
  ul: (props: any) => <Box as="ul" pt={2} fontSize="19px" pl={4} ml={2} {...props} />,
  ol: (props: any) => <Box as="ol" pt={2} fontSize="19px" pl={4} ml={2} {...props} />,
  li: (props: any) => <Box as="li" pb={1} fontSize="19px" textDecor='underline' {...props} />,
  strong: Tstrong,
  CodeSandBox,
  EventBubbling,
  EventCapturing,
  AsyncWithtHook,
  ToggleWithHook,
  CounterExample,
  CounterPrevExample,
  blockquote: Quote,
};

export { CustomLink };
export default MDXComponents;
