import React, { useState } from 'react';
import { Box, Center, Checkbox, Flex, Text } from '@chakra-ui/react';

const Bubbling = () => {
  const [propagateLevel, setPropagateLevel] = useState<number[]>([]);
  const [bubbledName, setBubbledName] = useState<string>();
  const [propagationStopped, setPropagationStopped] = useState<boolean>(false);

  const handleParentClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setTimeout(() => setPropagateLevel((prevState) => [...prevState, 1]), 1600);
    propagationStopped && event.stopPropagation();
    setBubbledName('PARENT');
  };
  const handleFirstChildClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setTimeout(() => setPropagateLevel((prevState) => [...prevState, 2]), 1300);
    propagationStopped && event.stopPropagation();
    setBubbledName('First Child');
  };
  const handleSecondChildClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setTimeout(() => setPropagateLevel((prevState) => [...prevState, 3]), 1000);
    propagationStopped && event.stopPropagation();
    setBubbledName('Second Child');
  };

  return (
    <Center
      bg="blackAlpha.900"
      color="white"
      flexDirection="column"
      fontSize="1rem"
      height="600px"
      width="100%"
      borderRadius="10px"
      padding="1rem"
    >
      <Flex mb="1rem" gap="1rem" fontSize="2xl">
        Clicked on <Text color="red.500"> {bubbledName}</Text>
      </Flex>
      <Flex gap="1rem" mb="2rem">
        <Checkbox
          colorScheme="blue"
          size="lg"
          defaultChecked={false}
          onChange={() => {
            setPropagationStopped((prevState) => !prevState);
            setPropagateLevel([]);
          }}
        >
          Stop Propagation
        </Checkbox>
      </Flex>
      <Box
        p="3rem"
        onClick={(e) => {
          return handleParentClick(e);
        }}
        border="3px solid blue"
        borderRadius="10px"
        boxShadow={propagateLevel.includes(1) ? '0px 0px 50px blue' : 'initial'}
        mb="1rem"
      >
        <Text>LEVEL 1</Text>
        <Box
          p="3rem"
          onClick={(e) => {
            return handleFirstChildClick(e);
          }}
          border="3px solid green"
          borderRadius="10px"
          boxShadow={propagateLevel.includes(2) ? '0px 0px 50px green' : 'initial'}
        >
          <Text>LEVEL 2</Text>
          <Box
            p="3rem"
            onClick={(e) => {
              return handleSecondChildClick(e);
            }}
            border="3px solid red"
            borderRadius="10px"
            boxShadow={propagateLevel.includes(3) ? '0px 0px 50px red' : 'initial'}
          >
            <Text>LEVEL 3</Text>
          </Box>
        </Box>
      </Box>
    </Center>
  );
};

export default Bubbling;
