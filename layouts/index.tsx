import { Avatar, Box, Flex, Heading, Link, Stack, Text, useColorMode } from '@chakra-ui/core';
import BlogSeo from '@components/BlogSeo';
import { Layout } from '@components/index';
import { parseISO, format } from 'date-fns';
import React from 'react';

// type FrontMatter = {
//   title: string;
//   snippet: string;
//   timestamp: string;
// };

const editUrl = (slug: string) =>
  `https://github.com/leerob/leerob.io/edit/master/pages/blog/${slug}.mdx`;
const discussUrl = (slug: string) =>
  `https://mobile.twitter.com/search?q=${encodeURIComponent(`https://leerob.io/blog/${slug}`)}`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function BlogLayout({ children, frontMatter }: any) {
  const slug = frontMatter.__resourcePath.replace('blog/', '').replace('.mdx', '');
  const { colorMode } = useColorMode();
  const textColor = {
    light: 'gray.700',
    dark: 'gray.400',
  };

  return (
    <Layout>
      <BlogSeo url={`https://ogzolguncu.io/blog/${slug}`} {...frontMatter} />
      <Stack
        as="article"
        spacing={8}
        justifyContent="center"
        alignItems="flex-start"
        m="0 auto 4rem auto"
        maxWidth="700px"
        w="100%"
      >
        <Flex
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="flex-start"
          maxWidth="700px"
          w="100%"
        >
          <Heading letterSpacing="tight" mb={2} as="h1" size="2xl">
            {frontMatter.title}
          </Heading>
          <Flex
            justify="space-between"
            align={['initial', 'center']}
            direction={['column', 'row']}
            mt={2}
            w="100%"
            mb={4}
          >
            <Flex align="center">
              <Avatar
                size="xs"
                name="Oğuzhan Olguncu"
                src="https://media-exp1.licdn.com/dms/image/C4E03AQHv_LowbjEUOw/profile-displayphoto-shrink_100_100/0?e=1606953600&v=beta&t=-tVK2oYnkpwrtm9xKgcCyz4jJCiREvlQWjmizKocuYY"
                mr={2}
              />
              <Text fontSize="sm" color={textColor[colorMode]}>
                {frontMatter.by}
                {'Oğuzhan Olguncu / '}
                {format(parseISO(frontMatter.publishedAt), 'MMMM dd, yyyy')}
              </Text>
            </Flex>
            <Text fontSize="sm" color="gray.500" minWidth="100px" mt={[2, 0]}>
              {frontMatter.readingTime.text}
              {` • `}
            </Text>
          </Flex>
        </Flex>
        {children}
        <Box>
          <Link href={discussUrl(slug)} isExternal>
            {'Discuss on Twitter'}
          </Link>
          {` • `}
          <Link href={editUrl(slug)} isExternal>
            {'Edit on GitHub'}
          </Link>
        </Box>
      </Stack>
    </Layout>
  );
}
