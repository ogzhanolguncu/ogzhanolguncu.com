import React, { useEffect, useMemo, useState } from 'react';
import { InferGetStaticPropsType } from 'next';
import { Flex, Box, Heading, Text, Input, Button } from '@chakra-ui/react';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';

import { getAllFilesFrontMatter } from 'lib/mdx';
import Layout from 'componentsV2/Layout';
import ArticleList from 'componentsV2/Article/ArticleList';
import { ScaleBox } from 'componentsV2/ScaleBox';
import { groupBy, rand } from 'utils';
import { languageColorizer } from 'utils/languageColorizer';

type Props = InferGetStaticPropsType<typeof getStaticProps>;

const url = 'https://ogzhanolguncu.com/blog';
const title = 'Blog – Oğuzhan Olguncu';
const description = 'Programming tutorials, guides and technical writing about web related stuff.';

const Blog = ({ groupedBlogPosts, languageTags }: Props) => {
  const router = useRouter();

  const [searchValue, setSearchValue] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const articleList = useMemo(
    () => Object.entries(groupedBlogPosts).map(([year]) => groupedBlogPosts[year]),
    [],
  );
  const filteredTags = articleList.map((posts) =>
    posts.filter((post) => selectedTags.some((x) => post.languageTags.includes(x))),
  );
  const isFilteredTagsEmpty = !filteredTags.flatMap((x) => x).length;
  const articles = isFilteredTagsEmpty ? articleList : filteredTags;

  const filteredArticles = articles.map((posts) =>
    posts.filter((post) => post.title.toLowerCase().includes(searchValue.toLowerCase())),
  );

  const filteredData = groupBy(
    filteredArticles.flatMap((posts) => posts),
    'year',
  );

  useEffect(() => {
    if (!router.query.tag) return;

    setSelectedTags((prevState) => [...prevState, router.query.tag as string]);
    window.scrollTo({
      top: 100,
      behavior: 'smooth',
    });
  }, [router.query.tag]);

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
        <Flex justifyContent="center" alignItems="center" margin="5rem 0" flexDirection="column">
          <Heading
            as="h1"
            fontSize={['2rem', '2rem', '3rem', '3rem']}
            marginBottom="1rem"
            fontWeight="bold"
            lineHeight="1.4"
          >
            Blog
          </Heading>
          <Text textAlign="center" fontSize="1.3rem" marginBottom="1.5rem">
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
              color: '#1a202c',
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
                  <Button
                    isActive={selectedTags.includes(tag)}
                    fontSize={['15px', '15px', '16px', '18px']}
                    variant="ghost"
                    border="3px solid black"
                    boxShadow="8px 8px #8080805e"
                    borderRadius="10px"
                    backgroundColor={languageTags[tag]}
                    color={languageTags[tag] ? '#e9e2dd' : 'initial'}
                    _hover={{
                      bg: '#000',
                      color: '#e9e2dd',
                    }}
                    _active={{
                      color: '#e9e2dd',
                      backgroundColor: '#000',
                    }}
                    onClick={() => {
                      const tagAlreadyExist = selectedTags.includes(tag);
                      setSelectedTags((prevState) =>
                        tagAlreadyExist
                          ? prevState.filter((article) => article !== tag)
                          : [...prevState, tag],
                      );
                    }}
                  >
                    {tag}
                  </Button>
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
