import React from 'react';
import { Button } from '@chakra-ui/react';

type Props = {
  text: string;
};

const ArticleTag = ({ text }: Props) => {
  return (
    <Button
      fontSize={['15px', '15px', '16px', '18px']}
      variant="ghost"
      border="3px solid black"
      boxShadow="6px 6px #8080805e"
      borderRadius="10px"
      _hover={{ bg: '#000', color: '#e9e2dd' }}
      _even={{
        backgroundColor: '#000',
        color: '#e9e2dd',
      }}
      _active={{
        color: '#000',
        backgroundColor: 'transparent',
      }}
    >
      {text}
    </Button>
  );
};

export default ArticleTag;
