import { Heading, Text, Box } from '@chakra-ui/core';
import { Layout, Card } from '@components/index';
//images
import ExampleImg from 'images/typescript.png';

const guides = () => {
  const card = {
    id: 1,
    title: 'A Complete Guide to CSS Concepts and Fundamentals',
    description:
      'This guide covers all the fundamentals of CSS - from syntax, selectors, and specificity to layouts and responsive media queries selectors, and specificity to layouts and responsive media queries',
  };
  return (
    <Layout>
      <Heading
        textAlign="center"
        fontSize={['2rem', '2rem', '3rem', '3rem']}
        color="#343a40"
        margin="1.5rem 0"
      >
        Guides
      </Heading>
      <Text textAlign="center" fontSize="1.3rem" color="#60656c" marginBottom="1.5rem">
        The missing instruction manuals of the web.
      </Text>
      <Box
        d="grid"
        gridTemplateColumns={[
          'repeat(1,minmax(0,1fr))',
          'repeat(2,minmax(0,1fr))',
          'repeat(2,minmax(0,1fr))',
          'repeat(3,minmax(0,1fr))',
        ]}
        gridGap="1.5rem"
        mt="2rem"
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
