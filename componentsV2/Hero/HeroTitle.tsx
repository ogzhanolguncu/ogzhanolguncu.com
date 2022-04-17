import React from 'react';
import { Box, Button, Flex, Text } from '@chakra-ui/react';

const HeroSectionTitle = () => {
  return (
    <Flex flexDirection="column" lineHeight="1.1" color="#000" mt={['0', '0', '2rem', '2rem']}>
      <Text fontWeight="bold" fontSize={['14px', '14px', '18px', '21px']}>
        - Hey, there!
      </Text>
      <Box
        as="h1"
        fontSize={['40px', '40px', '55px', '72px']}
        fontWeight="bold"
        letterSpacing={['0.07rem', '0.07rem', '0.15rem', '0.15rem']}
      >
        <Text mt="1.3rem">Programming</Text>
        <Flex>
          in
          <Text mx="0.5rem" background="black" color="#fff" px="0.1rem">
            simple
          </Text>
          words.
        </Flex>
      </Box>
      <Text
        mt="1.3rem"
        fontSize={['12px', '12px', '18px', '21px']}
        lineHeight="1.5"
        fontWeight="medium"
      >
        You can read my blog, view my guides & blog,
        <Box as="br" /> or learn more about me.
      </Text>
      <Button
        width={['300px', '300px', '233px', '233px']}
        mt={['50px', '50px', '110px', '110px']}
        mb={['50px', '50px', '0', '0']}
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
