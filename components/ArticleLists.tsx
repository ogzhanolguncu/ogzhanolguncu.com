import Link from 'next/link';

import { Box, Text, Flex, Heading, Link as StyledLink, Tag } from '@chakra-ui/core';
import styled from '@emotion/styled';

import { Popular, Blog } from 'global';

const Article = styled(Box)`
  display: flex;
  justify-content: space-between;

  border-radius: 20px;
  box-sizing: border-box;
  padding: 0.8rem 1rem;
  margin: 0 -1rem;

  @media screen and (min-width: 1100px) {
    width: 1070px;
    &:hover {
      background-color: #f6f8fb;
    }
  }

  @media screen and (max-width: 800px) {
    flex-direction: column;
    border-bottom: 1px solid #d6d9de;
    border-radius: 0;
    justify-content: center;
  }
`;

const ArticleTitle = styled(Box)`
  display: flex;
  @media screen and (max-width: 800px) {
    flex-direction: column;
    margin-bottom: 10px;
  }
`;

type Props = {
  popular?: Popular;
  blogs: Blog[];
};

const ArticleLists = ({ popular, blogs }: Props) => {
  const backgroundColor = ['#fff3bf', '#d3f9d8', 'rgba(0,0,0,.1)', '#fff0f6', '#f3f0ff', '#e3fafc'];

  return (
    <Flex flexDirection="column" m="3rem 0">
      <Flex
        w="100%"
        borderBottom={['none', 'none', '1px solid #d6d9de', '1px solid #d6d9de']}
        alignItems="center"
        paddingBottom=".5rem"
      >
        <Heading color="#343A40">{popular ? 'Popular Articles' : 'Latest Articles'}</Heading>
        <Link href="www.google.com">
          <StyledLink
            ml="3rem"
            mt=".5rem"
            fontWeight="500"
            padding=".3rem .5rem"
            backgroundColor="#f6f8fb"
            borderRadius="3rem"
            _hover={{ textDecoration: 'none', backgroundColor: '#868E96', color: 'white' }}
            fontSize=".8rem"
          >
            View All
          </StyledLink>
        </Link>
      </Flex>
      <Flex mt="1.5rem" alignItems="flex-start" justifyContent="center" flexDirection="column">
        <Article>
          <Link href="www.google.com">
            <StyledLink _hover={{ textDecoration: 'none' }}>
              <ArticleTitle>
                {!popular ? (
                  <Tag
                    fontSize=".9rem"
                    p=".5rem"
                    borderRadius=".3rem"
                    m={['1rem 1rem 10px 0', 'auto 1rem auto 0']} //for responsive
                    height="15px"
                    backgroundColor="#d3f9d8"
                    fontWeight="700"
                    w="max-content"
                  >
                    New!
                  </Tag>
                ) : null}
                <Text>
                  <span style={{ fontSize: '.8rem', color: '#787f87', fontWeight: 'revert' }}>
                    Semptember 10, 2020
                  </span>
                  <Heading fontSize="1.15rem">
                    Understanding the Event Loop, Callbacks, Promises, and Async/Await in JavaScript
                  </Heading>
                </Text>
              </ArticleTitle>
            </StyledLink>
          </Link>
          <Box
            d="flex"
            justifyContent={['space-evenly', 'space-between']}
            alignItems="center"
            w="350px"
            flexWrap="wrap"
          >
            <Tag
              width="max-content"
              height="20px"
              p=".4rem .6rem"
              fontSize=".8rem"
              borderRadius="16px"
              marginBottom="7px"
              backgroundColor="#fff3bf"
              _hover={{ cursor: 'pointer' }}
            >
              javascript
            </Tag>
            <Tag
              width="max-content"
              height="20px"
              p=".4rem .6rem"
              fontSize=".8rem"
              borderRadius="16px"
              marginBottom="7px"
              backgroundColor="#d3f9d8"
              _hover={{ cursor: 'pointer' }}
            >
              fundamentals
            </Tag>
            <Tag
              width="max-content"
              height="20px"
              p=".4rem .6rem"
              fontSize=".8rem"
              borderRadius="16px"
              marginBottom="7px"
              backgroundColor="rgba(0,0,0,.1)"
              _hover={{ cursor: 'pointer' }}
            >
              asynchronous
            </Tag>
          </Box>
        </Article>
        {blogs.map((blog) => (
          <Article key={blog.id}>
            <Link href="www.google.com">
              <StyledLink _hover={{ textDecoration: 'none' }}>
                <ArticleTitle>
                  {!popular ? (
                    <Tag
                      fontSize=".9rem"
                      p=".5rem"
                      borderRadius=".3rem"
                      m={['1rem 1rem 10px 0', 'auto 1rem auto 0']} //for responsive
                      height="15px"
                      backgroundColor="#d3f9d8"
                      fontWeight="700"
                      w="max-content"
                    >
                      New!
                    </Tag>
                  ) : null}
                  <Text>
                    <span style={{ fontSize: '.8rem', color: '#787f87', fontWeight: 'revert' }}>
                      {blog.date}
                    </span>
                    <Heading fontSize="1.15rem">{blog.title}</Heading>
                  </Text>
                </ArticleTitle>
              </StyledLink>
            </Link>
            <Box
              d="flex"
              justifyContent={['space-evenly', 'space-between']}
              alignItems="center"
              w="350px"
              flexWrap="wrap"
            >
              {blog.tags.map((tag, index) => (
                <Tag
                  key={index}
                  width="max-content"
                  height="20px"
                  p=".4rem .6rem"
                  fontSize=".8rem"
                  borderRadius="16px"
                  marginBottom="7px"
                  backgroundColor={`${
                    backgroundColor[Math.floor(Math.random() * backgroundColor.length)]
                  }`}
                  _hover={{ cursor: 'pointer' }}
                >
                  {tag}
                </Tag>
              ))}
            </Box>
          </Article>
        ))}
      </Flex>
    </Flex>
  );
};

export default ArticleLists;
