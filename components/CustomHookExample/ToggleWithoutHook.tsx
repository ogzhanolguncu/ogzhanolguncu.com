import { Alert, Button, Flex, Text } from '@chakra-ui/react';
import React from 'react';

function ToggleWithoutHook() {
  const [on, toggle] = React.useState(false);
  return (
    <Flex flexDirection="column" boxShadow="outline" rounded="md" width="50%" padding="1rem">
      <Alert status="success" d="flex" justifyContent="center">
        <Text>{on ? 'ON' : 'OFF'}</Text>
      </Alert>
      <Button onClick={() => toggle((prevState) => !prevState)}>TOGGLE</Button>
      <Button onClick={() => toggle(true)}>SET TOGGLE ON</Button>
      <Button onClick={() => toggle(false)}>SET TOGGLE OFF</Button>
    </Flex>
  );
}

export default ToggleWithoutHook;
