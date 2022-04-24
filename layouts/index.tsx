import React from 'react';
import { Flex, Heading, Stack, Text, Link, Box } from '@chakra-ui/react';
import { languageColorizer } from 'utils/languageColorizer';
import dayjs from 'dayjs';

import BlogSeo from '@components/BlogSeo';
import Layout from 'componentsV2/Layout';
import ArticleTag from 'componentsV2/Article/ArticleTag';

export default function BlogLayout({ children, frontMatter }: any) {
  const slug = frontMatter.slug;

  return (
    <Layout>
      <BlogSeo url={`https://ogzhanolguncu.com/blog/${slug}`} {...frontMatter} />
      <Stack
        spacing={8}
        justifyContent="center"
        alignItems="flex-start"
        m="0 auto 4rem auto"
        maxWidth="800px"
        w="100%"
      >
        <Flex
          margin="5rem 0"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          maxWidth="800px"
          w="100%"
          textAlign="center"
        >
          <Heading letterSpacing="tight" mb={2} size="2xl" lineHeight="1.4">
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
              <Box fontSize="md" fontWeight="500">
                <Text>Oğuzhan Olguncu</Text>
                <Text>{dayjs(frontMatter.publishedAt).format('MMMM D, YYYY')}</Text>
                <Text>{frontMatter.readingTime.text}</Text>
              </Box>
            </Flex>
          </Flex>
          <Flex justifyContent="center" w="100%" gap="1rem">
            {frontMatter.languageTags?.map((tag: string) => {
              const color = languageColorizer()[tag];
              return <ArticleTag text={tag} bgColor={color} key={tag} />;
            })}
          </Flex>
        </Flex>
        {children}
        <Link
          display="flex"
          flexDirection="row"
          alignItems="center"
          isExternal
          href={`https://github.com/ogzhanolguncu/ogzhanolguncu.com/blob/master/data/blog/${slug}.mdx`}
        >
          <Text marginLeft=".5rem" marginTop="5px">
            Edit this page
          </Text>
        </Link>
      </Stack>
    </Layout>
  );
}
