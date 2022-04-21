import React from 'react';
import Link from 'next/link';
import { Box, Flex, Heading, Text } from '@chakra-ui/react';

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
        <Flex
          flexDirection="column"
          bgGradient="linear-gradient(45deg, yellow.300 0%, pink.100 100%);"
          border="3px solid black"
          boxShadow="8px 8px #8080805e"
          borderRadius="10px"
          padding="1rem"
          width="30%"
          height="300px"
          gap="1.5rem"
        >
          <Heading
            as="h3"
            fontSize={['17px', '17px', '18px', '21px']}
            fontWeight="bold"
            letterSpacing="0.3px"
            lineHeight="30px"
          >
            <Link href="#">Microfrontend with Module Federation, Typrescript and React</Link>
          </Heading>
          <Box lineHeight="30px">
            Microfrontend project with
            <Text as="span" color="#fff" background="#000" p="3px" ml="5px">
              React
            </Text>
            <Text as="span">, </Text>
            <Box>
              <Text as="span" color="#fff" background="#000" p="3px">
                Typescript
              </Text>
              <Text as="span">, </Text>
              and
              <Text as="span" color="#fff" background="#000" p="3px" ml="5px">
                Module Federation
              </Text>
              , to bootstrap federated applications.
            </Box>
          </Box>
        </Flex>

        <Flex
          flexDirection="column"
          border="3px solid black"
          boxShadow="8px 8px #8080805e"
          borderRadius="10px"
          padding="1rem"
          width="30%"
          height="300px"
          gap="1.5rem"
          as="section"
        >
          <Heading
            as="h3"
            fontSize={['17px', '17px', '18px', '21px']}
            fontWeight="bold"
            letterSpacing="0.3px"
            lineHeight="30px"
          >
            <Link href="https://github.com/ogzhanolguncu/react-typescript-module-federation">
              Microfrontend with Module Federation, Typrescript and React
            </Link>
          </Heading>
          <Box lineHeight="30px">
            Microfrontend project with
            <Text as="span" color="#fff" background="#000" p="3px" ml="5px">
              React
            </Text>
            <Text as="span">, </Text>
            <Box>
              <Text as="span" color="#fff" background="#000" p="3px">
                Typescript
              </Text>
              <Text as="span">, </Text>
              and
              <Text as="span" color="#fff" background="#000" p="3px" ml="5px">
                Module Federation
              </Text>
              , to bootstrap federated applications.
            </Box>
          </Box>
        </Flex>

        <Flex
          flexDirection="column"
          backgroundColor="pink.300"
          bgGradient="linear-gradient(45deg, pink.100 0%, yellow.300 100%);"
          border="3px solid black"
          boxShadow="8px 8px #8080805e"
          borderRadius="10px"
          padding="1rem"
          width="30%"
          height="300px"
          gap="1.5rem"
        >
          <Heading
            as="h3"
            fontSize={['17px', '17px', '18px', '21px']}
            fontWeight="bold"
            letterSpacing="0.3px"
            lineHeight="30px"
          >
            <Link href="#">Microfrontend with Module Federation, Typrescript and React</Link>
          </Heading>
          <Box lineHeight="30px">
            Microfrontend project with
            <Text as="span" color="#fff" background="#000" p="3px" ml="5px">
              React
            </Text>
            <Text as="span">, </Text>
            <Box>
              <Text as="span" color="#fff" background="#000" p="3px">
                Typescript
              </Text>
              <Text as="span">, </Text>
              and
              <Text as="span" color="#fff" background="#000" p="3px" ml="5px">
                Module Federation
              </Text>
              , to bootstrap federated applications.
            </Box>
          </Box>
        </Flex>
      </Flex>
    </>
  );
};

export default index;
