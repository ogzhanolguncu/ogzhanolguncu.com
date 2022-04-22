import React, { PropsWithChildren } from 'react';
import { Flex } from '@chakra-ui/react';

import Navbar from './Navbar';
import Footer from './Footer';

type Props = {
  title?: string;
};

const Layout = ({ children }: PropsWithChildren<Props>) => {
  return (
    <Flex w="100%" justifyContent="flex-top" alignItems="center" flexDir="column" bgColor="siteBg">
      <Flex
        bgGradient="linear(to-r, #CACDD3, #E2D0C3, #E2D0C3)"
        width="100%"
        maxWidth={['340px', '600px', '800px', '1300px']}
        px={['0.5rem', '1rem', '2rem', '3rem']}
        py={['0.5rem', '1rem', '2rem', '2rem']}
        my={['1.5rem', '2rem', '3rem', '3rem']}
        borderRadius="xl"
        flexDir="column"
      >
        <Navbar />
        {children}
        <Footer />
      </Flex>
    </Flex>
  );
};

export default Layout;
