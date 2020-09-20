import React, { useState } from 'react';
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
} from '@chakra-ui/core';

import { useForm } from 'react-hook-form';
import axios from 'axios';
import Cookies from 'js-cookie';

type LoginForm = {
  userName: string;
  password: string;
};

type ResponseType = {
  jwtToken: string;
  userName: string;
};

const Login = () => {
  const { handleSubmit, register } = useForm<LoginForm>();
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  const onSubmit = handleSubmit(async ({ userName, password }) => {
    setPending(true);
    const { data } = await axios.post<ResponseType>('http://localhost:3001/auth/login', {
      userName,
      password,
    });
    Cookies.set('token', data.jwtToken, { expires: 60 });
    //SET COOKIE KISMINDA KALINDI
    //https://www.mikealche.com/software-development/how-to-implement-authentication-in-next-js-without-third-party-libraries

    setPending(false);
  });

  const handlePasswordVisibility = () => setShowPassword(!showPassword);

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
