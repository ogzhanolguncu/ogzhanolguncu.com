import { Box, Flex, Grid, Heading, Text } from '@chakra-ui/core';
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
      <Grid templateColumns="50px 1fr 4fr" gap={6} alignItems="stretch" mt="1.5rem">
        <Box w="100%" h="10">
          📝
        </Box>
        <Text w="100%" h="10" ml="-2rem">
          Take Note
        </Text>
        <Text w="100%" h="10">
          A free, open source notes app for the web.
        </Text>
      </Grid>
    </Flex>
  );
};

export default Project;
