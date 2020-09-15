import { Button, Flex, Heading, Text } from '@chakra-ui/core';
import React from 'react';

const Newsletter = () => {
  return (
    <Flex flexDirection="column" m="3rem 0">
      <Flex
        borderBottom={['none', 'none', '1px solid #d6d9de', '1px solid #d6d9de']}
        alignItems="center"
        paddingBottom=".5rem"
      >
        <Heading color="#343A40">Newsletter</Heading>
      </Flex>
      <Flex mt="1.5rem" flexDirection="column">
        <Text mb="1.5rem" fontSize="1.05rem" color="#495057">
          I send out an email when I create something new. Subscribe to get updates!
        </Text>
        <Button
          width={['200px', '200px', '200px', '200px']}
          backgroundColor="#5c7cfa"
          color="white"
          padding="30px 30px"
          _hover={{ backgroundColor: '#3b5bdb' }}
          fontWeight="600"
          fontSize={['15px', '16px', '16px', '18px']}
        >
          <Text mr="8px">&#9889;</Text>
          Join Newsletter
        </Button>
      </Flex>
    </Flex>
  );
};

export default Newsletter;
