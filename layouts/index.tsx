import { Flex, Heading, Stack, Tag, Text, useColorMode, Link, Icon } from '@chakra-ui/core';
import BlogSeo from '@components/BlogSeo';
import { Layout } from '@components/index';
import { parseISO, format } from 'date-fns';
import React, { useContext } from 'react';
import colorMap from 'styles/colorMap';
import { useRouter } from 'next/router';
import { ColorModeContext } from '@contexts/CustomColorContext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function BlogLayout({ children, frontMatter }: any) {
  const router = useRouter();
  const slug = frontMatter.__resourcePath.replace('blog/', '').replace('.mdx', '');
  const { colorMode } = useColorMode();
  const colorModeObj = useContext(ColorModeContext);
  const textColor = {
    light: 'gray.700',
    dark: 'gray.400',
  };

  return (
    <Layout>
      <BlogSeo url={`https://ogzhanolguncu.com/blog/${slug}`} {...frontMatter} />
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
          margin="5rem 0"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="flex-start"
          maxWidth="700px"
          w="100%"
          textAlign="center"
        >
          <Heading
            letterSpacing="tight"
            mb={2}
            as="h1"
            size="2xl"
            color={colorModeObj.titleColor[colorMode]}
          >
            {frontMatter.title}
          </Heading>
          <Flex
            justifyContent="space-between"
            align={['initial', 'center']}
            direction={['column', 'row']}
            mt={2}
            w="100%"
            mb={4}
          >
            <Flex justifyContent="center" width="100%" my="1rem">
              <Text fontSize="md" color={textColor[colorMode]}>
                {frontMatter.by}
                {`Oğuzhan Olguncu\u00a0\u00a0\u00a0/\u00a0\u00a0\u00a0`}
                {format(parseISO(frontMatter.publishedAt), 'MMMM dd, yyyy')}
                {`\u00a0\u00a0\u00a0/\u00a0\u00a0\u00a0 ${frontMatter.readingTime.text} `}
              </Text>
            </Flex>
          </Flex>
          <Flex justifyContent="center" w="100%">
            {frontMatter.languageTags?.map((tag: string, index: number) => {
              const color = colorMap[tag];
              return (
                <Tag
                  size={'sm'}
                  key={index}
                  color="#fff"
                  backgroundColor={color?.color}
                  _hover={{ cursor: 'pointer', backgroundColor: color.hover }}
                  mr="5px"
                  onClick={() =>
                    router.push({
                      pathname: '/blog/',
                      query: { tag },
                    })
                  }
                >
                  {tag}
                </Tag>
              );
            })}
          </Flex>
        </Flex>
        {children}
        <Link
          isExternal
          href={`https://github.com/ogzhanolguncu/ogzhanolguncu.com/tree/master/pages/blog/${slug}.mdx`}
        >
          <Icon aria-label="edit" name="edit" size="1.5rem" />
          Edit this page
        </Link>
      </Stack>
    </Layout>
  );
}
