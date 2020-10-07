import { Heading, Text, Box, useColorMode, Flex } from '@chakra-ui/core';
import { Layout, Card } from '@components/index';
import { ColorModeContext } from '@contexts/CustomColorContext';
//images
import ExampleImg from 'images/typescript.png';
import { useContext } from 'react';

const guides = () => {
  const colorModeObj = useContext(ColorModeContext);
  const { colorMode } = useColorMode();

  const card = {
    id: 1,
    title: 'A Complete Guide to CSS Concepts and Fundamentals',
    description:
      'This guide covers all the fundamentals of CSS - from syntax, selectors, and specificity to layouts and responsive media queries selectors, and specificity to layouts and responsive media queries',
  };
  return (
    <Layout>
      <Flex justifyContent="center" alignItems="center" flexDirection="column" margin="1.5rem 0">
        <Heading
          textAlign="center"
          as="h2"
          fontSize={['2rem', '2rem', '3rem', '3rem']}
          marginBottom="1rem"
          marginTop={['0.6rem', '0', '0', '0']}
          fontWeight="bold"
          color={colorModeObj.titleColor[colorMode]}
        >
          Guides
        </Heading>
        <Text textAlign="center" fontSize="1.3rem" color="#60656c">
          The missing instruction manuals of the web.
        </Text>
      </Flex>
      <Box
        d="grid"
        gridTemplateColumns={[
          'repeat(1,minmax(0,1fr))',
          'repeat(2,minmax(0,1fr))',
          'repeat(2,minmax(0,1fr))',
          'repeat(3,minmax(0,1fr))',
        ]}
        gridGap="1.5rem"
        mb={['3rem', '4rem', '5rem', '5rem']}
      >
        <Card img={ExampleImg} title={card.title} description={card.description} />
        <Card img={ExampleImg} title={card.title} description={card.description} />
        <Card img={ExampleImg} title={card.title} description={card.description} />
        <Card img={ExampleImg} title={card.title} description={card.description} />
        <Card img={ExampleImg} title={card.title} description={card.description} />
        <Card img={ExampleImg} title={card.title} description={card.description} />
      </Box>
    </Layout>
  );
};

export default guides;
