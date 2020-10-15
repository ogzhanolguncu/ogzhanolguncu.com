import {
  Box,
  Button,
  useToast,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from '@chakra-ui/core';
// import { ColorModeContext } from '@contexts/CustomColorContext';
import React from 'react';
import { useRef, useState } from 'react';

const Newsletter = () => {
  // const colorModeObj = useContext(ColorModeContext);
  // const { colorMode } = useColorMode();

  const inputEl = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const subscribe = async (e: React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/subscribe', {
      body: JSON.stringify({
        email: inputEl?.current?.value,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    setLoading(false);
    const { error } = await res.json();

    if (error) {
      toast({
        title: 'An error occurred.',
        description: error,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });

      return;
    }

    // inputEl?.current?.value = '';
    toast({
      title: 'Success!',
      description: 'You are now subscribed.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box border="1px solid" borderRadius={4} padding={6} my={4} w="100%">
      <Heading as="h5" size="lg" mb={2}>
        Subscribe to the newsletter
      </Heading>
      <Text>Get emails from me about web development, tech, and early access to new articles.</Text>
      <InputGroup size="md" mt={4}>
        <Input
          aria-label="Email for newsletter"
          placeholder="tim@apple.com"
          ref={inputEl}
          type="email"
        />
        <InputRightElement width="6.75rem">
          <Button
            isLoading={loading}
            fontWeight="bold"
            h="1.75rem"
            size="sm"
            onClick={(e: React.MouseEvent<HTMLInputElement>): void => {
              subscribe(e);
            }}
          >
            Subscribe
          </Button>
        </InputRightElement>
      </InputGroup>
    </Box>
  );
};

export default Newsletter;
