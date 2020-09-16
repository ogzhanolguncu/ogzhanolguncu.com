import { Box, Flex, Heading, Text, Link as StyledLink } from '@chakra-ui/core';
import Link from 'next/link';
// import styled from '@emotion/styled';

// const StyledLink = styled(LinkComponent)`
//   padding: '.5rem 1rem';
//   border-radius: '20px';
//   &:hover {
//     text-decoration: none;
//   }
//   @media screen and (min-width: 968px) {
//     &:hover {
//       background-color: '#f6f8fb';
//     }
//   }
// `;

const Project = () => {
  return (
    <Flex flexDirection="column" m="3rem 0">
      <Flex
        w="100%"
        borderBottom={['none', 'none', '1px solid #d6d9de', '1px solid #d6d9de']}
        alignItems="center"
        paddingBottom=".5rem"
      >
        <Heading color="#343A40">Projects</Heading>
      </Flex>
      <Flex mt="1.5rem" width="100%" flexDirection="column">
        <Link href="www.google.com">
          <StyledLink
            href="www.google.com"
            target="_blank"
            _hover={{ textDecoration: 'none', bg: '#f6f8fb' }}
            m="auto -1rem"
            borderRadius="20px"
            padding=".5rem 1rem"
          >
            <Flex flexDirection={['column', 'column', 'row', 'row']}>
              <Flex flex="1">
                <Box h="10" mr="0.8rem" fontSize="1.15rem">
                  📝
                </Box>
                <Text h="10" fontSize="1.15rem" fontWeight="bold">
                  Take Note
                </Text>
              </Flex>
              <Text h="10" flex="3" fontSize="1.1rem" fontWeight="400" color="#787f87">
                A free, open source notes app for the web.
              </Text>
            </Flex>
          </StyledLink>
        </Link>
        <Link href="www.google.com">
          <StyledLink
            _hover={{ textDecoration: 'none', bg: '#f6f8fb' }}
            m="auto -1rem"
            borderRadius="20px"
            padding=".5rem 1rem"
          >
            <Flex flexDirection={['column', 'column', 'row', 'row']}>
              <Flex flex="1">
                <Box h="10" mr="0.8rem" fontSize="1.15rem">
                  🌙
                </Box>
                <Text h="10" fontSize="1.15rem" fontWeight="bold">
                  New Moon
                </Text>
              </Flex>
              <Text h="10" flex="3" fontSize="1.1rem" fontWeight="400" color="#787f87">
                The optimized dark theme for web development. Your new favorite theme.
              </Text>
            </Flex>
          </StyledLink>
        </Link>
        <Link href="www.google.com">
          <StyledLink
            _hover={{ textDecoration: 'none', bg: '#f6f8fb' }}
            m="auto -1rem"
            borderRadius="20px"
            padding=".5rem 1rem"
          >
            <Flex flexDirection={['column', 'column', 'row', 'row']}>
              <Flex flex="1">
                <Box h="10" mr="0.8rem" fontSize="1.15rem">
                  🔱
                </Box>
                <Text h="10" fontSize="1.15rem" fontWeight="bold">
                  MVC.js
                </Text>
              </Flex>
              <Text h="10" flex="3" fontSize="1.1rem" fontWeight="400" color="#787f87">
                A simple Todo MVC application in JavaScript.
              </Text>
            </Flex>
          </StyledLink>
        </Link>
      </Flex>
    </Flex>
  );
};

export default Project;
