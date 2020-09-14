import { Box, Flex, Heading, Text } from '@chakra-ui/core';
import React from 'react';

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
        <Flex padding=".5rem 0" flexDirection={['column', 'column', 'row', 'row']}>
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
        <Flex padding=".5rem 0" flexDirection={['column', 'column', 'row', 'row']}>
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
        <Flex padding=".5rem 0" flexDirection={['column', 'column', 'row', 'row']}>
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
      </Flex>
    </Flex>
  );
};

export default Project;
