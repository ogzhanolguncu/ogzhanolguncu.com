import { Flex, Link as StyledLink, Button, Icon } from '@chakra-ui/core';
import Link from 'next/link';
import React from 'react';

const Footer = () => {
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
        justifyContent="center"
        w="100%"
        alignItems="center"
        p={['1rem', '1rem', '2rem', '3rem']}
      >
        <StyledLink href="https://github.com/ogzhanolguncu" title="GitHub" isExternal>
          <Button color="gray.500" variant="ghost">
            <Icon aria-label="Twitter" name="github" size="1.5rem" />
          </Button>
        </StyledLink>
        <StyledLink href="https://github.com/ogzhanolguncu" title="LinkedIn" isExternal>
          <Button color="gray.500" variant="ghost">
            <Icon aria-label="LinkedIn" name="linkedin" size="1.5rem" />
          </Button>
        </StyledLink>
        <StyledLink href="https://github.com/ogzhanolguncu" title="Email" isExternal>
          <Button color="gray.500" variant="ghost">
            <Icon aria-label="Email" name="mail" size="1.5rem" />
          </Button>
        </StyledLink>
        <StyledLink href="https://github.com/ogzhanolguncu" title="Email" isExternal>
          <Button color="gray.500" variant="ghost">
            <Icon aria-label="Email" name="codewars" size="1.5rem" />
          </Button>
        </StyledLink>
      </Flex>
    </Flex>
  );
};

export default Footer;
