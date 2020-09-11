import { useColorMode, Button, Flex, Box, IconButton, Text } from '@chakra-ui/core';
import styled from '@emotion/styled';
import NextLink from 'next/link';

const StickyNav = styled(Flex)`
  position: sticky;
  z-index: 10;
  top: 0;
  backdrop-filter: saturate(180%) blur(20px);
  transition: background-color 0.1 ease-in-out;
`;

const Layout = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <StickyNav bg="blue.500">
      <Flex
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        bg="blue.500"
        as="nav"
        p={4}
        mx="auto"
        maxWidth="1100px"
      >
        <Box>
          <NextLink href="/dashboard" passHref>
            <Button
              fontSize="lg"
              as="a"
              variant="ghost"
              _hover={{ bg: 'rgba(0,0,0,.2)' }}
              p={[1, 4]}
              color="white"
            >
              <Text fontSize="2xl" mr={2}>
                🦉
              </Text>
              Oğuzhan Olguncu
            </Button>
          </NextLink>
        </Box>

        <Box>
          <NextLink href="/dashboard" passHref>
            <Button
              fontSize="lg"
              as="a"
              variant="ghost"
              _hover={{ bg: 'rgba(0,0,0,.2)' }}
              p={[1, 4]}
              color="white"
            >
              About
            </Button>
          </NextLink>
          <NextLink href="/blog" passHref>
            <Button
              fontSize="lg"
              as="a"
              variant="ghost"
              _hover={{ bg: 'rgba(0,0,0,.2)' }}
              p={[1, 4]}
              color="white"
            >
              Blog
            </Button>
          </NextLink>
          <NextLink href="/about" passHref>
            <Button
              fontSize="lg"
              as="a"
              variant="ghost"
              _hover={{ bg: 'rgba(0,0,0,.2)' }}
              p={[1, 4]}
              color="white"
            >
              Guides
            </Button>
          </NextLink>
          <IconButton
            fontSize="xl"
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

export default Layout;
