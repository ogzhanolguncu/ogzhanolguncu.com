import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';

import { Layout, Project, Newsletter, ArticleLists } from '@components/index';

import {
  Flex,
  Box,
  Heading,
  Text,
  Image,
  Link as StyledLink,
  Button,
  useColorMode,
} from '@chakra-ui/core';

import personalImage from '../public/350.jpg';
import data from 'data.json';

import { Blog, Popular } from 'global';
import React from 'react';

type Props = {
  popular?: Popular;
  blogs: Blog[];
};

const Home = ({ popular, blogs }: Props) => {
  const { colorMode } = useColorMode();

  const colorModeObj = {
    titleColor: { light: '#343a40', dark: 'white' },
    linkColor: { light: 'blue.500', dark: 'white' },
    linkHoverColor: { light: '#1b1d25', dark: 'orange.300' },
    buttonColor: { light: '#5c7cfa', dark: 'orange.500' },
    buttonHoverColor: { light: '#3b5bdb', dark: 'orange.600' },
    feedBackButtonColor: { light: '#3b5bdb', dark: '#787f87' },
  };

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
            color={colorModeObj.titleColor[colorMode]}
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
                color={colorModeObj.linkColor[colorMode]}
                href="#"
                fontWeight="700"
                _hover={{
                  textDecoration: 'none',
                  borderBottom: '0.3rem solid #dbe4ffde',
                  borderBottomColor:
                    colorMode === 'light'
                      ? colorModeObj.linkHoverColor.light
                      : colorModeObj.linkHoverColor.dark,
                  color:
                    colorMode === 'light'
                      ? colorModeObj.linkHoverColor.light
                      : colorModeObj.linkHoverColor.dark,
                }}
              >
                blog
              </StyledLink>
            </Link>
            , view my
            <Link href="www.google.com">
              <StyledLink
                color={colorModeObj.linkColor[colorMode]}
                href="#"
                fontWeight="700"
                ml={2}
                _hover={{
                  textDecoration: 'none',
                  borderBottom: '0.3rem solid #dbe4ffde',
                  borderBottomColor:
                    colorMode === 'light'
                      ? colorModeObj.linkHoverColor.light
                      : colorModeObj.linkHoverColor.dark,
                  color:
                    colorMode === 'light'
                      ? colorModeObj.linkHoverColor.light
                      : colorModeObj.linkHoverColor.dark,
                }}
              >
                guides & blog
              </StyledLink>
            </Link>
            , or learn more
            <Link href="www.google.com">
              <StyledLink
                color={colorModeObj.linkColor[colorMode]}
                href="#"
                fontWeight="700"
                ml={2}
                _hover={{
                  textDecoration: 'none',
                  borderBottom: '0.3rem solid',
                  borderBottomColor:
                    colorMode === 'light'
                      ? colorModeObj.linkHoverColor.light
                      : colorModeObj.linkHoverColor.dark,
                  color:
                    colorMode === 'light'
                      ? colorModeObj.linkHoverColor.light
                      : colorModeObj.linkHoverColor.dark,
                }}
              >
                about me
              </StyledLink>
            </Link>
            .
          </Text>
          <Box flexDirection={['column', 'column', 'row', 'row']} d="flex">
            <Button
              backgroundColor={colorModeObj.buttonColor[colorMode]}
              color="white"
              padding="30px 30px"
              _hover={{
                backgroundColor:
                  colorMode === 'light'
                    ? colorModeObj.buttonHoverColor.light
                    : colorModeObj.buttonHoverColor.dark,
              }}
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
              color={colorModeObj.feedBackButtonColor[colorMode]}
              padding="30px 30px"
              fontWeight="600"
              fontSize={['15px', '16px', '16px', '18px']}
              _hover={{
                backgroundColor:
                  colorMode === 'light' ? colorModeObj.buttonHoverColor.light : 'orange.500',
                color: 'white',
              }}
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
