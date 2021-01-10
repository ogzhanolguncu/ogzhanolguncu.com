import Layout from './Layout';
import { Flex, Image, Box, Heading, Text, Button } from '@chakra-ui/react';
import Router from 'next/router';
import error401 from 'images/401.png';

const Error401 = () => {
  const redirectToLogin = () => {
    Router.push('/dashboard/login');
  };
  return (
    <Layout>
      <Flex
        flexDirection={['column-reverse', 'column-reverse', 'row', 'row']}
        justifyContent="center"
        alignItems="center"
        maxW="100%"
        height={['62vh', '65vh', '55vh', '55vh']}
        textAlign={['center', 'center', 'right', 'right']}
      >
        <Box>
          <Heading mb="10px" fontSize="70px">
            Oops!
          </Heading>
          <Text mb="10px" fontWeight="bold" fontSize="17px">
            It's just a 401 error!
          </Text>
          <Text mb="20px">You are not authorized for selected action.</Text>
          <Button onClick={redirectToLogin}>Go to Login</Button>
        </Box>
        <Image w={['400px', '500px', '500px', '600px']} src={error401}></Image>
      </Flex>
    </Layout>
  );
};

export default Error401;
