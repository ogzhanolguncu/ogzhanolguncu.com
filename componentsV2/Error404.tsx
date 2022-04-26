import Layout from './Layout';
import { Flex, Img, Box, Heading, Text, Button } from '@chakra-ui/react';
import Router from 'next/router';

const Error404 = () => {
  const redirectToHome = () => {
    Router.push('/');
  };
  return (
    <Layout>
      <Flex
        flexDirection={['column', 'column', 'row', 'row']}
        justifyContent="center"
        alignItems="center"
        maxW="100%"
        height={['62vh', '65vh', '55vh', '55vh']}
        margin="5rem 0"
        textAlign={['center', 'center', 'initial', 'initial']}
      >
        <Img
          w={['300px', '400px', '400px', '500px']}
          h={['300px', '400px', '400px', '400px']}
          src={'/static/images/14.svg'}
        />
        <Box>
          <Heading textTransform="uppercase" mb="10px">
            404 - Page Not Found
          </Heading>
          <Text mb="20px">
            The page you are looking for might have been removed, had its name changed or is
            temporarily unavailable.
          </Text>
          <Button
            width={['300px', '400px', '400px', '233px']}
            mt="50px"
            mb={['50px', '50px', '50px', '0']}
            bgColor="black"
            color="#fff"
            px="55px"
            py="30px"
            fontWeight="bold"
            fontSize="16px"
            boxShadow="6px 6px #8080805e"
            _hover={{ backgroundColor: '#e9e2dd', color: '#000' }}
            _active={{
              backgroundColor: 'black',
            }}
            onClick={redirectToHome}
          >
            Go to home
          </Button>
        </Box>
      </Flex>
    </Layout>
  );
};

export default Error404;
