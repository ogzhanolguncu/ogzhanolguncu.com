import { Avatar, Flex, Heading, Stack, Tag, Text, useColorMode } from '@chakra-ui/core';
import BlogSeo from '@components/BlogSeo';
import { Layout } from '@components/index';
import { parseISO, format } from 'date-fns';
import React from 'react';
import colorMap from 'styles/colorMap';

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
                size="sm"
                name="Oğuzhan Olguncu"
                src="https://avatars2.githubusercontent.com/u/21091016?s=460&u=788774b6cbffaa93e2b8eadcd10ef32e1c6ecf58&v=4"
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
            </Text>
          </Flex>
          <Flex justifyContent="flex-end" w="100%">
            {frontMatter.languageTags?.map((tag: string, index: number) => {
              const color = colorMap[tag];
              return (
                <Tag
                  size={'sm'}
                  key={index}
                  color="#fff"
                  backgroundColor={color?.color}
                  _hover={{ backgroundColor: color.hover }}
                  mr="5px"
                >
                  {tag}
                </Tag>
              );
            })}
          </Flex>
        </Flex>
        {children}
      </Stack>
    </Layout>
  );
}
