import { Flex, Link as StyledLink } from '@chakra-ui/core';
import Link from 'next/link';
import React from 'react';

const Newsletter = () => {
  return (
    <Flex flexDirection="column" justifyContent="center" alignItems="center">
      <Flex justifyContent="space-between">
        <Link href="/blog">
          <StyledLink
            _hover={{
              textDecoration: 'none',
              backgroundColor: 'rgba(0,0,0,0.15)',
              borderRadius: '.35rem',
            }}
            mr="1.5rem"
            p=".75rem 1.25rem"
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
            mr="1.5rem"
            p=".75rem 1.25rem"
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
            mr="1.5rem"
            p=".75rem 1.25rem"
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
            mr="1.5rem"
            p=".75rem 1.25rem"
          >
            RSS
          </StyledLink>
        </Link>
      </Flex>
    </Flex>
  );
};

export default Newsletter;
