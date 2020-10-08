import { GetStaticProps } from 'next';
import React, { useContext } from 'react';
import Link from 'next/link';
import { getSortedPostsData } from 'lib/posts';
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
} from '@chakra-ui/core';
import colorMap from 'styles/colorMap';
import { addTwoMonthToPublishedDate, compareDateWithTodaysDate } from 'utils/dateOperations';
import { ColorModeContext } from '@contexts/CustomColorContext';
import { Article, ArticleTitle, Layout } from '@components/index';
// import groupBy from 'lodash.groupby';

type Props = {
  blogPosts: StaticBlog[];
  // grouped: any;
};

const Blog = ({ blogPosts }: Props) => {
  // eslint-disable-next-line no-console
  // console.log(grouped);
  const colorModeObj = useContext(ColorModeContext);
  const { colorMode } = useColorMode();

  return (
    <Layout>
      <Flex justifyContent="center" alignItems="center" margin="1.5rem 0" flexDirection="column">
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
        <Input variant="outline" placeholder="Search..." maxWidth="400px" />
      </Flex>
      <Flex alignItems="flex-start" justifyContent="center" flexDirection="column">
        {blogPosts.map((blog) => (
          <Article
            key={blog.id}
            justifyContent="space-between"
            alignItems="space-between"
            color={colorMode === 'light' ? 'light' : 'dark'}
          >
            <Link href={`/blog/${blog.id}`}>
              <StyledLink _hover={{ textDecoration: 'none' }}>
                <ArticleTitle>
                  {compareDateWithTodaysDate(addTwoMonthToPublishedDate(blog.publishedAt)) ? (
                    <Tag
                      fontSize={['.7rem', '.7rem', '.8rem', '.7 rem']}
                      p=".5rem"
                      borderRadius=".3rem"
                      m={[
                        'auto .4rem auto 0',
                        'auto .4rem auto 0',
                        'auto .4rem auto 0',
                        '1rem 1rem 10px 0',
                      ]} //for responsive
                      height="15px"
                      backgroundColor="#d3f9d8"
                      fontWeight="700"
                      width={['2.7rem', '2.7rem', '', '']}
                      minW=""
                      color={colorModeObj.articleNewTagTextColor[colorMode]}
                      background={colorModeObj.articleNewTagBackgroundColor[colorMode]}
                    >
                      New!
                    </Tag>
                  ) : null}
                  <Box>
                    <Text color="#787f87" fontSize=".8rem" fontWeight="600">
                      {blog.publishedAt}
                    </Text>
                    <Heading
                      fontSize={['1rem', '1.1rem', '1.15rem', '1.15rem']}
                      w={['100%', '100%', 'max-content', 'max-content']}
                    >
                      {blog.title}
                    </Heading>
                  </Box>
                </ArticleTitle>
              </StyledLink>
            </Link>
            <Box
              d="flex"
              flexDirection={['column', 'row', 'row', 'row']}
              justifyContent={['flex-start', 'flex-start', 'flex-end', 'flex-end']}
              alignItems={['flex-start', 'center', 'center', 'center']}
              w="100%"
              flexWrap="wrap"
            >
              {blog?.languageTags?.map((tag, index) => {
                const color = colorMap[tag.toLowerCase()];
                return (
                  <Tag
                    key={index}
                    width="max-content"
                    height="20px"
                    p=".3rem .5rem"
                    fontSize=".8rem"
                    borderRadius="16px"
                    marginBottom="7px"
                    marginRight=".5rem"
                    color="#fff"
                    backgroundColor={color?.color}
                    _hover={{ cursor: 'pointer', backgroundColor: color?.hover }}
                  >
                    {tag}
                  </Tag>
                );
              })}
            </Box>
          </Article>
        ))}
      </Flex>
    </Layout>
  );
};

export default Blog;

export const getStaticProps: GetStaticProps = async () => {
  const blogPosts = getSortedPostsData();
  //Slicing used to get first four digit of date => YYYY-DD-MM
  // const grouped = groupBy(blogPosts, (x) => x.publishedAt.toString().slice(0, 4));
  return {
    props: { blogPosts },
  };
};
