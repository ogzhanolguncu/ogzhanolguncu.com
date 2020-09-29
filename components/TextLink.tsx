import React from 'react';
import { Link as StyledLink, useColorMode } from '@chakra-ui/core';

type Props = {
  text: string;
};
const TextLink = ({ text }: Props) => {
  const { colorMode } = useColorMode();
  return (
    <StyledLink
      _hover={{ textDecoration: 'none' }}
      href="#"
      borderBottom={colorMode === 'light' ? '4px solid #dbe4ff' : null}
      color={colorMode === 'light' ? '#000' : '#6ab0f3'}
    >
      <strong>{text}</strong>
    </StyledLink>
  );
};

export default TextLink;
