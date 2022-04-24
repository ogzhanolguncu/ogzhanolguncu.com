import React, { useState } from 'react';
import { Text, Button, Center } from '@chakra-ui/react';

const CounterPrevExample = () => {
  const [counter, setCounter] = useState(0);

  return (
    <Center flexDirection="column" gap="2rem" width="100%">
      <Text textAlign="center">Counter: {counter}</Text>
      <Button
        backgroundColor="#fff"
        onClick={() => {
          setCounter((prevState) => prevState + 1);
          setCounter((prevState) => prevState + 2);
          setCounter((prevState) => prevState + 3);
        }}
      >
        Click me to increase the counter!
      </Button>
    </Center>
  );
};

export default CounterPrevExample;
