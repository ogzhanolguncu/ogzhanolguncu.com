import React, { useState } from 'react';
import { InferGetStaticPropsType } from 'next';
import { Flex, Box, Heading, Text, Input } from '@chakra-ui/react';
import { NextSeo } from 'next-seo';
import { groupBy, rand } from 'utils/utils';

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
  const [searchValue, setSearchValue] = useState('');

  const filteredItems = Object.entries(groupedBlogPosts).map(([year]) =>
    groupedBlogPosts[year].filter((post) =>
      post.title.toLowerCase().includes(searchValue.toLowerCase()),
    ),
  );

  const filteredData = groupBy(
    filteredItems.flatMap((posts) => posts),
    'year',
  );

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

          <Input
            maxWidth="400px"
            fontSize={['15px', '15px', '16px', '18px']}
            variant="ghost"
            border="3px solid black"
            boxShadow="6px 6px #8080805e"
            borderRadius="10px"
            backgroundColor="transparent"
            placeholder="Search articles"
            _placeholder={{
              color: '#000',
            }}
            onChange={(e) => setSearchValue(e.currentTarget.value)}
          />

          <Box
            padding={['1rem', '2rem', '2rem', '2rem']}
            marginTop="1.3rem"
            d="flex"
            flexDirection="row"
            justifyContent="flex-start"
            alignItems="flex-start"
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

          <Flex flexDirection="column" width="100%" justifyContent="flex-start">
            {Object.entries(filteredData)
              .reverse()
              .map(([year, blogPosts]) => (
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

  const groupedBlogPosts = groupBy(blogPosts, 'year');
  return {
    props: { blogPosts, groupedBlogPosts, languageTags: languageColorizer() },
  };
};
