import React from 'react';
import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import ProjectContainer from './ProjectContainer';

const Projects = () => {
  return (
    <>
      <Flex alignItems="center">
        <Heading fontSize={['20px', '20px', '24px', '30px']} fontWeight="bold" mr="45px">
          Projects
        </Heading>
      </Flex>
      <Flex
        mt="35px"
        alignItems="flex-start"
        justifyContent="space-between"
        flexDirection={['column', 'column', 'column', 'row']}
        gap="1rem 1.5rem"
      >
        <ProjectContainer
          bgGradient="linear-gradient(45deg, yellow.300 0%, pink.100 100%);"
          title="Microfrontend with Module Federation, Typrescript and React"
          link="https://github.com/ogzhanolguncu/react-typescript-module-federation"
        >
          Microfrontend project with
          <Text as="span" color="#fff" background="#000" p="3px" ml="4px">
            React
          </Text>
          <Text as="span">, </Text>
          <Box>
            <Text as="span" color="#fff" background="#000" p="3px">
              Typescript
            </Text>
            <Text as="span">, </Text>
            and
            <Text as="span" color="#fff" background="#000" p="3px" ml="4px ">
              Module Federation
            </Text>
            <Text as="span"> to bootstrap federated applications.</Text>
          </Box>
        </ProjectContainer>

        <ProjectContainer
          title="Lottery Smart Contract with Solidity"
          link="https://github.com/ogzhanolguncu/lottery-client"
          bgGradient="linear-gradient(160deg, yellow.300 0%, pink.100 100%);"
        >
          Smart contract written in
          <Text as="span" color="#fff" background="#000" p="3px" mx="4px">
            Solidity
          </Text>
          with
          <Text as="span" color="#fff" background="#000" p="3px" ml="4px">
            React
          </Text>
          <Text as="span">, </Text>
          and
          <Text as="span" color="#fff" background="#000" p="3px" ml="4px">
            Typescript
          </Text>
          <Text as="span"> for the client. Running on Ropsten network.</Text>
        </ProjectContainer>

        <ProjectContainer
          bgGradient="linear-gradient(45deg, pink.100 0%, yellow.300 100%);"
          title="Hezarfenn Scripting Language"
          link="https://github.com/ogzhanolguncu/Hezarfenn"
        >
          An interpreted language written in
          <Text as="span" color="#fff" background="#000" p="3px" mx="4px">
            Typescript
          </Text>
          with hand-written lexer and parser. Supports closure, inheritance and conditions.
        </ProjectContainer>
      </Flex>
    </>
  );
};

export default Projects;
