/* eslint-disable @typescript-eslint/no-unused-vars */
import Link from 'next/link';

import NavbarButton from './NavbarButton';

import { useColorMode, Button, Flex, Box, IconButton, Text } from '@chakra-ui/react';
import { BsMoon } from 'react-icons/bs';
import { BiSun } from 'react-icons/bi';
import styled from '@emotion/styled';

const StickyNav = styled(Flex)`
  position: sticky;
  z-index: 10;
  top: 0;
  backdrop-filter: saturate(180%) blur(20px);
  transition: background-color 0.1 ease-in-out;
`;

const Navbar = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { colorMode, toggleColorMode } = useColorMode();

  const bgColor = { light: 'rgb(76, 110, 245, 0.8)', dark: 'rgb(26, 32, 44, 0.5)' };
  const color = { light: 'white', dark: 'gray.800' };

  return (
    <StickyNav bg={bgColor[colorMode]} color={color[colorMode]}>
      <Flex
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        as="nav"
        p={4}
        mx="auto"
        maxWidth="1150px"
      >
        <Box>
          <Link href="/" passHref>
            <Button
              fontWeight={['normal', 'medium', 'medium']}
              fontSize={['xs', 'sm', 'lg', 'xl']}
              as="a"
              variant="ghost"
              _hover={{ bg: 'rgba(0,0,0,.2)' }}
              p={[1, 4]}
              color="white"
            >
              <Text fontSize={['xl', '2xl', '2xl', '2xl']} mr={2}>
                🦉
              </Text>
              Oğuzhan Olguncu
            </Button>
          </Link>
        </Box>

        <Box>
          <NavbarButton LinkComponent={Link} href="/about" text="About" />
          <NavbarButton LinkComponent={Link} href="/blog" text="Blog" />
          <NavbarButton LinkComponent={Link} href="/guides" text="Guides" />
          <IconButton
            fontWeight={['normal', 'medium', 'bold']}
            fontSize={['xs', 'sm', 'lg', 'xl']}
            variant="ghost"
            _hover={{ bg: 'rgba(0,0,0,.2)' }}
            aria-label="Toggle dark mode"
            icon={colorMode === 'dark' ? <BiSun /> : <BsMoon />}
            onClick={toggleColorMode}
            color="white"
            _focus={{ boxShadow: 'none' }}
          />
        </Box>
      </Flex>
    </StickyNav>
  );
};

export default Navbar;
