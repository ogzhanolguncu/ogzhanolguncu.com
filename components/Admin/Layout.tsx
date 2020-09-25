import { ReactNode } from 'react';
import { Flex } from '@chakra-ui/core';

import Navbar from './Navbar';

type Props = {
  children?: ReactNode;
  title?: string;
};

const Layout = ({ children }: Props) => {
  return (
    <>
      <Navbar />
      <Flex maxWidth="1080px" direction="column" mx="auto" p={5}>
        {children}
      </Flex>
    </>
  );
};

export default Layout;
