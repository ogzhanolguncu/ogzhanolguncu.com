import { Flex, Link as StyledLink, Image } from '@chakra-ui/core';
import Link from 'next/link';
import React from 'react';
import nextImg from '/images/next2.svg';
import nestImg from '/images/nestjs.svg';
import typescriptImg from '/images/typescript.png';
import awsImg from '/images/aws.png';
import githubImg from '/images/github.png';

const Newsletter = () => {
  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      maxWidth="1080px"
      mx="auto"
      p={5}
    >
      <Flex justifyContent="space-between">
        <Link href="/blog">
          <StyledLink
            _hover={{
              textDecoration: 'none',
              backgroundColor: 'rgba(0,0,0,0.15)',
              borderRadius: '.35rem',
            }}
            mr={['.2rem', '1rem', '1.5rem', '1.5rem']}
            p={['.4rem .85rem', '.5rem 1rem', '.75rem 1.25rem', '.75rem 1.25rem']}
            fontSize={['.8rem', '.8rem', '1.1rem', '1.1rem']}
          >
            Blog
          </StyledLink>
        </Link>
        <Link href="/guides">
          <StyledLink
            _hover={{
              textDecoration: 'none',
              backgroundColor: 'rgba(0,0,0,0.15)',
              borderRadius: '.35rem',
            }}
            mr={['.2rem', '1rem', '1.5rem', '1.5rem']}
            p={['.4rem .85rem', '.5rem 1rem', '.75rem 1.25rem', '.75rem 1.25rem']}
            fontSize={['.8rem', '.8rem', '1.1rem', '1.1rem']}
          >
            Guides
          </StyledLink>
        </Link>
        <Link href="/newsletter">
          <StyledLink
            _hover={{
              textDecoration: 'none',
              backgroundColor: 'rgba(0,0,0,0.15)',
              borderRadius: '.35rem',
            }}
            mr={['.2rem', '1rem', '1.5rem', '1.5rem']}
            p={['.4rem .85rem', '.5rem 1rem', '.75rem 1.25rem', '.75rem 1.25rem']}
            fontSize={['.8rem', '.8rem', '1.1rem', '1.1rem']}
          >
            Newsletter
          </StyledLink>
        </Link>
        <Link href="/rss">
          <StyledLink
            _hover={{
              textDecoration: 'none',
              backgroundColor: 'rgba(0,0,0,0.15)',
              borderRadius: '.35rem',
            }}
            mr={['.2rem', '1rem', '1.5rem', '1.5rem']}
            p={['.4rem .85rem', '.5rem 1rem', '.75rem 1.25rem', '.75rem 1.25rem']}
            fontSize={['.8rem', '.8rem', '1.1rem', '1.1rem']}
          >
            RSS
          </StyledLink>
        </Link>
      </Flex>
      <Flex
        justifyContent="space-around"
        w={['100%', '70%', '60%', '60%']}
        alignItems="center"
        p={['1rem', '1rem', '2rem', '3rem']}
      >
        <Link href="www.google.com">
          <StyledLink w="30px">
            <Image src={typescriptImg} />
          </StyledLink>
        </Link>
        <Link href="www.google.com">
          <StyledLink w="30px">
            <Image src={nextImg} />
          </StyledLink>
        </Link>
        <Link href="www.google.com">
          <StyledLink w="30px">
            <Image src={nestImg} />
          </StyledLink>
        </Link>
        <Link href="www.google.com">
          <StyledLink w="30px">
            <Image src={awsImg} />
          </StyledLink>
        </Link>
        <Link href="www.google.com">
          <StyledLink w="30px">
            <Image src={githubImg} />
          </StyledLink>
        </Link>
      </Flex>
    </Flex>
  );
};

export default Newsletter;
