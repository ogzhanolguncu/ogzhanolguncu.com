import React, { PropsWithChildren } from 'react';
import { Text } from '@chakra-ui/react';

const NavbarText = ({ children }: PropsWithChildren<{}>) => {
  return (
    <Text fontWeight="medium" fontSize={['12px', '14px', '18px', '18px']} color="#000">
      {children}
    </Text>
  );
};

export default NavbarText;
