import { Button, Flex, Heading, Text, useColorMode } from '@chakra-ui/core';
import { ColorModeContext } from '@contexts/CustomColorContext';
import { useContext } from 'react';

const Newsletter = () => {
  const colorModeObj = useContext(ColorModeContext);

  const { colorMode } = useColorMode();
  return (
    <Flex flexDirection="column" m="3rem 0">
      <Flex
        borderBottom={['none', 'none', '1px solid #d6d9de', '1px solid #d6d9de']}
        alignItems="center"
        paddingBottom=".5rem"
      >
        <Heading
          fontSize={['1.7rem', '1.7rem', '2rem', '2rem']}
          color={colorModeObj.titleColor[colorMode]}
        >
          Newsletter
        </Heading>
      </Flex>
      <Flex mt="1.5rem" flexDirection="column">
        <Text mb="1.5rem" fontSize="1.1rem" color="#787f87" fontWeight="400">
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
