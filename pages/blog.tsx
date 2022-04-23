import React from 'react';
import { InferGetStaticPropsType } from 'next';
import { Flex, Box, Heading, Text } from '@chakra-ui/react';
import groupBy from 'lodash.groupby';
import { NextSeo } from 'next-seo';
import { rand } from 'utils/utils';

import { getAllFilesFrontMatter } from 'lib/mdx';

import Layout from 'componentsV2/Layout';
import ArticleList from 'componentsV2/Article/ArticleList';
import ArticleTag from 'componentsV2/Article/ArticleTag';
import { ScaleBox } from 'componentsV2/ScaleBox';
import { languageColorizer } from 'utils/languageColorizer';

type Props = InferGetStaticPropsType<typeof getStaticProps>;

const url = 'https://ogzhanolguncu.com/blog';
const title = 'Blog – Oğuzhan Olguncu';
const description = 'Programming tutorials, guides and technical writing about web related stuff.';

const Blog = ({ groupedBlogPosts, languageTags }: Props) => {
  return (
    <>
      <NextSeo
        title={title}
        description={description}
        canonical={url}
        openGraph={{
          url,
          title,
          description,
        }}
      />
      <Layout>
        <Flex
          justifyContent="center"
          alignItems="center"
          margin="5rem 0"
          flexDirection="column"
          color="#000"
        >
          <Heading
            as="h2"
            fontSize={['2rem', '2rem', '3rem', '3rem']}
            marginBottom="1rem"
            marginTop={['0.6rem', '0', '0', '0']}
            fontWeight="bold"
          >
            Blog
          </Heading>
          <Text textAlign="center" fontSize="1.3rem" color="#000" marginBottom="1.5rem">
            Articles, tutorials, snippets, musings, and everything else.
          </Text>

          <Box
            border="3px solid black"
            boxShadow="8px 8px #8080805e"
            borderRadius="16px"
            padding={['1rem', '2rem', '2rem', '2rem']}
            marginTop="1.3rem"
            d="flex"
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
            w={['100%', '90%', '75%', '75%']}
            flexWrap="wrap"
            gap="1rem"
          >
            {Object.keys(languageTags).map((tag: string, tagIndex: number) => (
              <Box key={tagIndex}>
                <ScaleBox duration={1} delayOrder={rand(1, 5)}>
                  <ArticleTag text={tag} bgColor={languageTags[tag]} />
                </ScaleBox>
              </Box>
            ))}
          </Box>
          <Box mt={['5rem', '5rem', '10rem', '10rem']} />

          <Flex flexDirection="column">
            {Object.entries(groupedBlogPosts)
              .reverse()
              .map(([year, blogPosts], index, arr) => (
                <Flex flexDirection="column" key={year}>
                  <Heading fontSize={['20px', '20px', '24px', '30px']} fontWeight="bold" mr="45px">
                    {year}
                  </Heading>
                  <ArticleList articles={blogPosts} />
                  <Box mt={['3rem', '3rem', '6rem', '6rem']} />
                </Flex>
              ))}
          </Flex>
        </Flex>
      </Layout>
    </>
  );
};

export default Blog;

export const getStaticProps = async () => {
  const blogPosts = await getAllFilesFrontMatter('blog');

  const groupedBlogPosts = groupBy(blogPosts, (x) => x.publishedAt.toString().slice(0, 4));
  return {
    props: { blogPosts, groupedBlogPosts, languageTags: languageColorizer() },
  };
};
