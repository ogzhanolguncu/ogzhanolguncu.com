import { GetStaticProps } from 'next';
import Link from 'next/link';
import fs from 'fs';
import React, { Fragment, useCallback, useContext, useEffect, useState } from 'react';
import { StaticBlog } from 'global';
import {
  Flex,
  Tag,
  Box,
  Heading,
  useColorMode,
  Link as StyledLink,
  Text,
  Input,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import colorMap from 'styles/colorMap';
import { addTwoMonthToPublishedDate, compareDateWithTodaysDate } from 'utils/dateOperations';
import { ColorModeContext } from '@contexts/CustomColorContext';
import { Article, ArticleTitle, Layout } from '@components/index';
import groupBy from 'lodash.groupby';
import Fuse from 'fuse.js';
import { generateRss } from 'utils/rssOperations';
import debounce from 'lodash.debounce';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { ScaleBox } from '@components/ScaleBox';
import { rand } from 'utils/utils';
import { getAllFilesFrontMatter } from 'lib/mdx';

type Props = {
  blogPosts: StaticBlog[];
  groupedBlogPosts: Record<number, StaticBlog[]>;
};

type FusedType = {
  item: StaticBlog;
};

const options = {
  includeScore: true,
  keys: ['title', 'id'],
};

const url = 'https://ogzhanolguncu.com/blog';
const title = 'Blog – Oğuzhan Olguncu';
const description = 'Programming tutorials, guides and technical writings about web related stuff.';

const Blog = ({ blogPosts, groupedBlogPosts }: Props) => {
  const colorModeObj = useContext(ColorModeContext);
  const { colorMode } = useColorMode();
  const [fusedBlog, setFusedBlog] = useState<Record<number, StaticBlog[]>>(groupedBlogPosts);
  const [input, setInput] = useState('');
  const [currentSelectedTag, setCurrentSelectedTag] = useState('');
  const fuse = new Fuse(blogPosts, options);
  const router = useRouter();

  const updateSearch = () => {
    const results = (fuse.search(input) as unknown) as FusedType[];
    const blogResults = results.map((res) => res.item);
    const searchedBlogPosts = groupBy(blogResults, (x) => x.publishedAt.toString().slice(0, 4));
    setFusedBlog(searchedBlogPosts);
  };

  const searchByTag = (tag: string) => {
    setCurrentSelectedTag(tag);
    const blogResults = blogPosts.filter((blog) => blog.languageTags.includes(tag));
    const searchedBlogPosts = groupBy(blogResults, (x) => x.publishedAt.toString().slice(0, 4));
    setFusedBlog(searchedBlogPosts);
  };

  const delayedSearch = useCallback(debounce(updateSearch, 400), [input]);

  useEffect(() => {
    if (input.length === 0) {
      return setFusedBlog(groupedBlogPosts);
    }
    delayedSearch();
    return delayedSearch.cancel; // If input state changes, it invokes delayedSearch so we no longer wait for old debounce instead we cancel it.
  }, [delayedSearch]);

  useEffect(() => {
    if (router.query?.tag !== undefined) {
      searchByTag(router.query?.tag as string);
      window.scrollTo({
        top: 100,
        behavior: 'smooth',
      });
    }
  }, [router]);

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
            as="h2"
            fontSize={['2rem', '2rem', '3rem', '3rem']}
            marginBottom="1rem"
            marginTop={['0.6rem', '0', '0', '0']}
            fontWeight="bold"
            color={colorModeObj.titleColor[colorMode]}
          >
            Blog
          </Heading>
          <Text textAlign="center" fontSize="1.3rem" color="#60656c" marginBottom="1.5rem">
            Articles, tutorials, snippets, musings, and everything else.
          </Text>
          <Input
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              setInput(e.target.value);
            }}
            value={input}
            variant="outline"
            placeholder="Search..."
            maxWidth="400px"
          />
          <Box
            marginTop="1.3rem"
            d="flex"
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
            w={['100%', '90%', '75%', '65%']}
            flexWrap="wrap"
          >
            {Object.keys(colorMap).map((tag: string, tagIndex: number) => {
              const color = colorMap[tag.toLowerCase()];
              return (
                <Box key={tagIndex}>
                  <ScaleBox duration={1} delayOrder={rand(1, 5)}>
                    <Tag
                      width="max-content"
                      height="20px"
                      minHeight="2rem"
                      p=".3rem .5rem"
                      fontSize=".8rem"
                      borderRadius="16px"
                      marginBottom="7px"
                      marginRight=".5rem"
                      color="#fff"
                      backgroundColor={color?.color}
                      _hover={{ cursor: 'pointer', backgroundColor: color?.hover }}
                      onClick={() => searchByTag(tag)}
                    >
                      {tag}
                    </Tag>
                  </ScaleBox>
                </Box>
              );
            })}
          </Box>
        </Flex>
        <Flex alignItems="flex-start" justifyContent="center" flexDirection="column">
          {Object.entries(fusedBlog).length > 0 ? (
            Object.keys(fusedBlog)
              .reverse()
              .map((blog, index) => (
                <Fragment key={index}>
                  <Heading
                    fontSize="1.5rem"
                    marginTop={index !== 0 ? '2.7rem' : '0'}
                    fontFamily="Inter"
                    paddingX="1rem"
                    marginBottom="1rem"
                  >
                    {blog}
                  </Heading>
                  {fusedBlog[(blog as unknown) as number].map((article) => (
                    <Article
                      key={`${blog}${article.id}`}
                      justifyContent="space-between"
                      alignItems="space-between"
                      color={colorMode === 'light' ? 'light' : 'dark'}
                    >
                      <Link href={`/blog/${article.id}`}>
                        <StyledLink _hover={{ textDecoration: 'none' }} w="100%">
                          <ArticleTitle>
                            {compareDateWithTodaysDate(
                              addTwoMonthToPublishedDate(article.publishedAt),
                            ) ? (
                              <Tag
                                fontSize={['.7rem', '.7rem', '.8rem', '.7 rem']}
                                p=".5rem"
                                borderRadius=".3rem"
                                m={[
                                  '1rem .4rem 1rem 0',
                                  '1rem .4rem 1rem 0',
                                  '1rem .4rem 1rem 0',
                                  '1rem 1rem 10px 0',
                                ]} //for responsive
                                height="15px"
                                fontWeight="700"
                                width={['2.7rem', '2.7rem', '', '']}
                                minW=""
                                minHeight="2rem"
                                color={colorModeObj.articleNewTagTextColor[colorMode]}
                                background={colorModeObj.articleNewTagBackgroundColor[colorMode]}
                              >
                                New!
                              </Tag>
                            ) : null}
                            <Box>
                              <Text
                                color={colorModeObj.publishedDateColor[colorMode]}
                                fontSize=".8rem"
                                fontWeight="600"
                                marginBottom={['1rem', '1rem', 0, 0]}
                              >
                                {article.publishedAt}
                              </Text>
                              <Heading
                                fontSize={['1rem', '1.1rem', '1.15rem', '1.15rem']}
                                w="100%"
                                fontFamily="Inter"
                              >
                                {article.title}
                              </Heading>
                            </Box>
                          </ArticleTitle>
                        </StyledLink>
                      </Link>
                      <Box
                        d="flex"
                        flexDirection={['row', 'row', 'row', 'row']}
                        justifyContent={['flex-start', 'flex-start', 'flex-end', 'flex-end']}
                        alignItems={['flex-start', 'center', 'center', 'center']}
                        w="100%"
                        flexWrap="wrap"
                      >
                        {article?.languageTags?.map((tag: string, tagIndex: number) => {
                          const color = colorMap[tag.toLowerCase()];
                          return (
                            <Tag
                              key={`${blog}${article.id}${tagIndex}`}
                              width="max-content"
                              height="20px"
                              p=".3rem .5rem"
                              minHeight="2rem"
                              fontSize=".8rem"
                              borderRadius="16px"
                              marginBottom="7px"
                              marginRight=".5rem"
                              color="#fff"
                              backgroundColor={color?.color}
                              _hover={{ cursor: 'pointer', backgroundColor: color?.hover }}
                              onClick={() => searchByTag(tag)}
                            >
                              {tag}
                            </Tag>
                          );
                        })}
                      </Box>
                    </Article>
                  ))}
                </Fragment>
              ))
          ) : (
            <Alert status="info" m="0 auto 40px auto" borderRadius="20px">
              <AlertIcon />
              Blog has not been found about{' '}
              <strong style={{ marginLeft: '3px' }}>{currentSelectedTag.toUpperCase()}</strong>
            </Alert>
          )}
        </Flex>
      </Layout>
    </>
  );
};

export default Blog;

export const getStaticProps: GetStaticProps = async () => {
  const blogPosts = (await getAllFilesFrontMatter('blog')).map((blog) => {
    blog.languageTags?.sort(() => 0.5 - Math.random());
    return blog;
  });
  // Slicing used to get first four digit of date => YYYY-DD-MM
  const rss = generateRss(blogPosts);
  fs.writeFileSync('./public/rss.xml', rss);

  const groupedBlogPosts = groupBy(blogPosts, (x) => x.publishedAt.toString().slice(0, 4));
  return {
    props: { blogPosts, groupedBlogPosts },
  };
};
