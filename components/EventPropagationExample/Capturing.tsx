import React, { useState } from 'react';
import { Box, Center, Checkbox, Flex, Text } from '@chakra-ui/react';

const Capturing = () => {
  const [propagateLevel, setPropagateLevel] = useState<number[]>([]);
  const [bubbledName, setBubbledName] = useState<string>();
  const [propagationStopped, setPropagationStopped] = useState<boolean>(false);
  const [sendAlert, setSendAlert] = useState<boolean>(false);

  const handleParentClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setPropagateLevel([]);
    setTimeout(() => setPropagateLevel((prevState) => [...prevState, 1]), 1000);
    propagationStopped && event.stopPropagation();
    sendAlert && alert('LEVEL 1');
    setBubbledName('LEVEL 3');
  };
  const handleFirstChildClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setPropagateLevel([]);

    setTimeout(() => setPropagateLevel((prevState) => [...prevState, 2]), 1300);
    propagationStopped && event.stopPropagation();
    sendAlert && alert('LEVEL 2');
    setBubbledName('LEVEL 2');
  };
  const handleSecondChildClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setPropagateLevel([]);

    setTimeout(() => setPropagateLevel((prevState) => [...prevState, 3]), 1600);
    propagationStopped && event.stopPropagation();
    sendAlert && alert('LEVEL 3');
    setBubbledName('LEVEL 1');
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
      {!sendAlert && (
        <Flex mb="1rem" gap="1rem" fontSize="2xl">
          Clicked on <Text color="red.500"> {bubbledName}</Text>
        </Flex>
      )}

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
        <Checkbox
          colorScheme="blue"
          size="lg"
          defaultChecked={false}
          onChange={() => {
            setSendAlert((prevState) => !prevState);
            setPropagateLevel([]);
          }}
        >
          Enable Alerts
        </Checkbox>
      </Flex>
      <Text>LEVEL 1</Text>
      <Box
        p="4rem"
        onClickCapture={handleParentClick}
        border="3px solid blue"
        borderRadius="10px"
        boxShadow={propagateLevel.includes(1) ? '0px 0px 50px blue' : 'initial'}
        mb="1rem"
      >
        <Text textAlign="center">LEVEL 2</Text>
        <Box
          p="3rem"
          onClickCapture={handleFirstChildClick}
          border="3px solid green"
          borderRadius="10px"
          boxShadow={propagateLevel.includes(2) ? '0px 0px 50px green' : 'initial'}
        >
          <Text textAlign="center">LEVEL 3</Text>
          <Box
            p="3rem"
            onClickCapture={handleSecondChildClick}
            border="3px solid red"
            borderRadius="10px"
            boxShadow={propagateLevel.includes(3) ? '0px 0px 50px red' : 'initial'}
          ></Box>
        </Box>
      </Box>
    </Center>
  );
};

export default Capturing;
