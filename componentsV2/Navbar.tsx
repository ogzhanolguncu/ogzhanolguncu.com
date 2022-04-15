import { Button, Flex, HStack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import React from 'react';
import NavbarButton from './NavbarButton';
import NavbarText from './NavbarTexts';

const Navbar = () => {
  return (
    <Flex
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      width="100%"
      as="nav"
      mx="auto"
      color="#000"
    >
      <Link href="/" passHref>
        <Button as="a" variant="ghost" _hover={{ bg: 'rgba(0,0,0,.07)' }} p="0">
          <Text fontSize={['lg', '2xl', '2xl', '3xl']} mr={['3px', '5px', '7px', '10px']}>
            🦉
          </Text>
          <NavbarText>Oğuzhan Olguncu</NavbarText>
        </Button>
      </Link>

      <HStack spacing={['10px', '30px', '40px', '60px']}>
        <NavbarButton LinkComponent={Link} href="/about" text="About" />
        <NavbarButton LinkComponent={Link} href="/blog" text="Blog" />
      </HStack>
    </Flex>
  );
};

export default Navbar;