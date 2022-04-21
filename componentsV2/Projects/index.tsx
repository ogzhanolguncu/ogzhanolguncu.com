import React from 'react';
import Link from 'next/link';
import { Flex, Heading } from '@chakra-ui/react';

const index = () => {
  return (
    <>
      <Flex alignItems="center" color="#000">
        <Heading fontSize={['20px', '20px', '24px', '30px']} fontWeight="bold" mr="45px">
          Projects
        </Heading>
      </Flex>
      <Flex
        mt="35px"
        alignItems="flex-start"
        justifyContent="space-between"
        flexDirection={['column', 'column', 'column', 'row']}
        gap="0 1.5rem"
      >
        <Flex flexDirection="column">
          <Heading
            as="h3"
            fontSize={['17px', '17px', '18px', '21px']}
            fontWeight="bold"
            letterSpacing="0.05px"
            border="3px solid black"
            boxShadow="6px 6px #8080805e"
            borderRadius="10px"
            padding="1rem"
            bgGradient="linear(gray.300,yellow.400,pink.200)"
          >
            <Link href="#">Microfrontend with Module Federation, Typrescript and React</Link>
          </Heading>
        </Flex>
        <Flex flexDirection="column">
          <Heading
            as="h3"
            fontSize={['17px', '17px', '18px', '21px']}
            fontWeight="bold"
            letterSpacing="0.05px"
            border="3px solid black"
            boxShadow="6px 6px #8080805e"
            borderRadius="10px"
            padding="1rem"
            bgGradient="linear(gray.300,yellow.400,pink.200)"
          >
            <Link href="#">Microfrontend with Module Federation, Typrescript and React</Link>
          </Heading>
        </Flex>
        <Flex flexDirection="column">
          <Heading
            as="h3"
            fontSize={['17px', '17px', '18px', '21px']}
            fontWeight="bold"
            letterSpacing="0.05px"
            border="3px solid black"
            boxShadow="6px 6px #8080805e"
            borderRadius="10px"
            padding="1rem"
            bgGradient="linear(gray.300,yellow.400,pink.200)"
          >
            <Link href="#">Microfrontend with Module Federation, Typrescript and React</Link>
          </Heading>
        </Flex>
      </Flex>
    </>
  );
};

export default index;
