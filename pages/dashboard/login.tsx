import React, { useEffect, useState } from 'react';
import {
  FormLabel,
  FormControl,
  Input,
  Button,
  Box,
  Flex,
  Heading,
  Icon,
  InputGroup,
  InputRightElement,
  Alert,
  AlertIcon,
  AlertDescription,
  AlertTitle,
} from '@chakra-ui/core';

import { useForm } from 'react-hook-form';
import useAuth from '@contexts/AuthContext';

type LoginForm = {
  userName: string;
  password: string;
};

const Login = () => {
  const { login, errorMessage, setErrorMessage } = useAuth();
  const { handleSubmit, register } = useForm<LoginForm>();
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [alertVisibility, setAlertVisibility] = useState(false);

  const onSubmit = handleSubmit(async ({ userName, password }) => {
    setPending(true);
    login(userName, password);
    setPending(false);
  });

  const handlePasswordVisibility = () => setShowPassword(!showPassword);

  const handleTimeoutDependencies = () => {
    setErrorMessage(undefined);
    setAlertVisibility(!alertVisibility);
  };

  useEffect(() => {
    setAlertVisibility(true);
    const timeOut = setTimeout(() => handleTimeoutDependencies(), 2000);

    return () => clearTimeout(timeOut);
  }, [errorMessage]);

  return (
    <Flex height="full" align="center" justifyContent="center" m="10rem 0">
      <Box p={8} maxWidth="500px" borderWidth={1} borderRadius={8} boxShadow="lg">
        <Box textAlign="center">
          <Heading fontFamily="Inter">Login</Heading>
        </Box>
        <Box my={4} textAlign="left" as="form" onSubmit={onSubmit}>
          <FormControl isRequired>
            <FormLabel>Username</FormLabel>
            <Input
              name="userName"
              placeholder="John Smith"
              size="lg"
              ref={register({ required: true })}
            />
          </FormControl>
          <FormControl isRequired mt={6}>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="*******"
                size="lg"
                ref={register({ required: true })}
              />
              <InputRightElement width="3rem">
                <Button h="1.5rem" size="sm" onClick={handlePasswordVisibility}>
                  {showPassword ? <Icon name="view-off" /> : <Icon name="view" />}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>
          {!!errorMessage && alertVisibility && (
            <Alert status="error" mt="20px" variant="solid">
              <AlertIcon />
              <AlertTitle mr={5}>404</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Button
            variantColor="teal"
            variant="outline"
            type="submit"
            width="full"
            mt={4}
            isLoading={pending}
          >
            Sign In
          </Button>
        </Box>
      </Box>
    </Flex>
  );
};

export default Login;
