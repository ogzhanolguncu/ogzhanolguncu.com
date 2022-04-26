import React from 'react';
import Link from 'next/link';
import { Flex, HStack, Image, Link as ChakraLink } from '@chakra-ui/react';

import NavigationButton from 'componentsV2/Navbar/NavigationButton';

const Footer = () => {
  return (
    <Flex
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      width="100%"
      as="footer"
      mx="auto"
    >
      <HStack spacing={['10px', '30px', '40px', '40px']}>
        <NavigationButton LinkComponent={Link} href="/about" text="About" />
        <NavigationButton LinkComponent={Link} href="/blog" text="Blog" />
      </HStack>
      <HStack spacing={['10px', '20px', '20px', '20px']}>
        <ChakraLink isExternal href="https://github.com/ogzhanolguncu" title="Github">
          <Image
            src="/static/images/github.svg"
            alt="Github SVG Icon"
            width={['35px', '40px', '60px', '60px']}
            height={['35px', '40px', '60px', '60px']}
          />
        </ChakraLink>

        <ChakraLink isExternal href="mailto:ogzhan11@gmail.com" title="Email">
          <Image
            src="/static/images/gmail.svg"
            alt="Gmail SVG Icon"
            width={['35px', '40px', '60px', '60px']}
            height={['35px', '40px', '60px', '60px']}
          />
        </ChakraLink>
        <ChakraLink isExternal href="https://linkedin.com/in/ogzhanolguncu" title="Linkedin">
          <Image
            src="/static/images/linkedin.svg"
            alt="Linkedin SVG Icon"
            width={['35px', '40px', '60px', '60px']}
            height={['35px', '40px', '60px', '60px']}
          />
        </ChakraLink>
      </HStack>
    </Flex>
  );
};

export default Footer;
