import React, { useState } from 'react';
import { Text, Button, Center } from '@chakra-ui/react';

const CounterExample = () => {
  const [counter, setCounter] = useState(0);

  return (
    <Center flexDirection="column" gap="2rem" width="100%">
      <Text textAlign="center">Counter: {counter}</Text>
      <Button
        onClick={() => {
          setCounter(counter + 1);
          setCounter(counter + 2);
          setCounter(counter + 3);
        }}
      >
        Click me to increase the counter!
      </Button>
    </Center>
  );
};

export default CounterExample;
