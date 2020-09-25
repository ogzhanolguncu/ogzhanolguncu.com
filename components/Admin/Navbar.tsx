import Link from 'next/link';

import NavbarButton from '../NavbarButton';

import { useColorMode, Button, Flex, Box, IconButton, Text } from '@chakra-ui/core';
import styled from '@emotion/styled';
import useAuth from '@contexts/AuthContext';

const StickyNav = styled(Flex)`
  position: sticky;
  z-index: 10;
  top: 0;
  backdrop-filter: saturate(180%) blur(20px);
  transition: background-color 0.1 ease-in-out;
`;

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { logout } = useAuth();

  const bgColor = { light: 'red.400', dark: 'rgb(26, 32, 44, 0.5)' };
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
          <Link href="dashboard" passHref>
            <Button
              fontWeight={['normal', 'medium', 'medium']}
              fontSize={['xs', 'sm', 'lg', 'xl']}
              as="a"
              variant="ghost"
              _hover={{ bg: 'rgba(0,0,0,.2)' }}
              p={[1, 4]}
              color="white"
            >
              <Text fontSize={['xl', '2xl', '2xl', '2xl']} mr={2} transform="rotate(180deg)">
                🦉
              </Text>
              Serkan Sayhan
            </Button>
          </Link>
        </Box>

        <Box>
          <NavbarButton LinkComponent={Link} href="posts" text="Posts" />
          <Button
            fontWeight={['normal', 'medium', 'bold']}
            fontSize={['xs', 'sm', 'lg', 'xl']}
            variant="ghost"
            _hover={{ bg: 'rgba(0,0,0,.2)' }}
            aria-label="Toggle dark mode"
            onClick={logout}
            color="white"
          >
            Logout
          </Button>
          <IconButton
            fontWeight={['normal', 'medium', 'bold']}
            fontSize={['xs', 'sm', 'lg', 'xl']}
            variant="ghost"
            _hover={{ bg: 'rgba(0,0,0,.2)' }}
            aria-label="Toggle dark mode"
            icon={colorMode === 'dark' ? 'sun' : 'moon'}
            onClick={toggleColorMode}
            color="white"
          />
        </Box>
      </Flex>
    </StickyNav>
  );
};

export default Navbar;
