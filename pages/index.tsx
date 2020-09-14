import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';

import { Layout, Project, Newsletter, ArticleLists } from '@components/index';

import { Flex, Box, Heading, Text, Image, Link as StyledLink, Button } from '@chakra-ui/core';

import personalImage from '../public/350.jpg';
import data from 'data.json';

import { Blog, Popular } from 'global';
import React from 'react';

type Props = {
  popular?: Popular;
  blogs: Blog[];
};

const Home = ({ popular, blogs }: Props) => {
  return (
    <Layout>
      <Head>
        <title>Personal Blog</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex
        margin={['1.5rem 0', '1.5rem 0', '1.5rem 0', '4.5rem 0']}
        flexDirection={['column-reverse', 'column-reverse', 'row']}
        justifyContent="space-between"
      >
        <Box maxW="600px">
          <Heading
            as="h1"
            fontSize={['1.6rem', '2rem', '2.3rem', '2.6rem']}
            lineHeight="1.1"
            marginBottom="2rem"
            marginTop={['0.6rem', '0', '0', '0']}
            fontWeight="bold"
            color="#343a40"
          >
            Hey! I'm Tania Rascia. I'm a software engineer and open-source creator.
          </Heading>
          <Text
            fontSize={['1rem', '1rem', '1.2rem', '1.3rem']}
            marginBottom="2.5rem"
            fontWeight="400"
            color="#787f87"
          >
            This website is my 🌱 digital garden—a compendium of the things I have learned and
            created over the years, and anything else I want to write about. You can read my{' '}
            <Link href="www.google.com">
              <StyledLink
                color="blue.500"
                href="#"
                fontWeight="700"
                _hover={{
                  textDecoration: '#dbe4ffde',
                  color: '#1b1d25',
                }}
              >
                blog
              </StyledLink>
            </Link>
            , view my
            <Link href="www.google.com">
              <StyledLink
                color="blue.500"
                href="#"
                fontWeight="700"
                ml={2}
                _hover={{
                  textDecoration: '#dbe4ffde',
                  color: '#1b1d25',
                }}
              >
                guides & blog
              </StyledLink>
            </Link>
            , or learn more
            <Link href="www.google.com">
              <StyledLink
                color="blue.500"
                href="#"
                fontWeight="700"
                ml={2}
                _hover={{
                  textDecoration: '#dbe4ffde',
                  color: '#1b1d25',
                }}
              >
                about me
              </StyledLink>
            </Link>
            .
          </Text>
          <Box flexDirection={['column', 'column', 'row', 'row']} d="flex">
            <Button
              backgroundColor="#5c7cfa"
              color="white"
              padding="30px 30px"
              _hover={{ backgroundColor: '#3b5bdb' }}
              fontWeight="600"
              fontSize={['15px', '16px', '16px', '18px']}
              mb={['10px', '10px', '0px', '0px']}
              mr={['0px', '0', '10px', '10px']}
            >
              <Text mr="8px">&#9889;</Text>
              Join Newsletter
            </Button>
            <Button
              backgroundColor="#edf2ff"
              color="#3b5bdb"
              padding="30px 30px"
              fontWeight="600"
              fontSize={['15px', '16px', '16px', '18px']}
              _hover={{ backgroundColor: '#3b5bdb', color: 'white' }}
            >
              <Text mr="8px">&#128239;</Text> Give Feedback
            </Button>
          </Box>
        </Box>
        <Box size={['350', '150']} margin={['auto 0', '10px 0', '0 0', '0 0']}>
          <Image
            src={personalImage}
            alt="Owl"
            borderRadius="16px"
            w={['150px', '150px', '350px']}
          />
        </Box>
      </Flex>
      <ArticleLists blogs={blogs} />
      <ArticleLists popular={popular} blogs={blogs} />
      <Project />
      <Newsletter />
    </Layout>
  );
};

export default Home;

export const getStaticProps: GetStaticProps = async () => {
  const popular = true;
  const blogs = data.Blogs;
  return {
    props: { popular, blogs },
  };
};
