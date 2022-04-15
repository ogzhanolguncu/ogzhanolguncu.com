import React from 'react';
import { Box, Button, Flex, Text } from '@chakra-ui/react';

const HeroSectionTitle = () => {
  return (
    <Flex flexDirection="column" lineHeight="1.1" color="#000" as="section">
      <Text fontWeight="bold" fontSize="21px">
        - Hey, there!
      </Text>
      <Box as="h1">
        <Text fontSize="72px" fontWeight="bold" letterSpacing="0.15rem" mt="1.3rem">
          Programming
        </Text>
        <Flex fontSize="72px" fontWeight="bold" letterSpacing="0.15rem">
          in
          <Text mx="0.5rem" background="black" color="#fff" px="0.1rem">
            simple
          </Text>
          words.
        </Flex>
      </Box>
      <Text mt="1.3rem" fontSize="21px" lineHeight="1.5" fontWeight="medium">
        You can read my blog, view my guides & blog,
        <Box as="br" /> or learn more about me.
      </Text>
      <Button
        width="233px"
        mt="105px"
        bgColor="black"
        color="#fff"
        px="55px"
        py="30px"
        fontWeight="bold"
        fontSize="16px"
        boxShadow="6px 6px gray"
        _hover={{
          backgroundColor: 'black',
        }}
        _active={{
          backgroundColor: 'black',
        }}
      >
        Join Newsletter
      </Button>
    </Flex>
  );
};

export default HeroSectionTitle;
