import React from 'react';
import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import ProjectContainer from './ProjectContainer';

const Projects = () => {
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
        gap="1rem 1.5rem"
      >
        <ProjectContainer
          bgGradient="linear-gradient(45deg, yellow.300 0%, pink.100 100%);"
          title="Microfrontend with Module Federation, Typrescript and React"
          link="#"
        >
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
            <Text as="span"> to bootstrap federated applications.</Text>
          </Box>
        </ProjectContainer>

        <ProjectContainer
          title="Microfrontend with Module Federation, Typrescript and React"
          link="#"
        >
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
            <Text as="span"> to bootstrap federated applications.</Text>
          </Box>
        </ProjectContainer>

        <ProjectContainer
          bgGradient="linear-gradient(45deg, pink.100 0%, yellow.300 100%);"
          title="Microfrontend with Module Federation, Typrescript and React"
          link="#"
        >
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
            <Text as="span"> to bootstrap federated applications.</Text>
          </Box>
        </ProjectContainer>
      </Flex>
    </>
  );
};

export default Projects;
