import Navbar from './Navbar';
import React, { ReactNode } from 'react';
import { Flex } from '@chakra-ui/core';
import Footer from './Footer';

type Props = {
  children?: ReactNode;
  title?: string;
};

const Layout = ({ children }: Props) => {
  return (
    <>
      <Navbar />
      <Flex maxWidth="1080px" w="100%" direction="column" mx="auto" p={5}>
        {children}
      </Flex>
      <Footer />
    </>
  );
};

export default Layout;
