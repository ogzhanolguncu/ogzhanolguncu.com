import { Button } from '@chakra-ui/react';
import React from 'react';

type Props = {
  text: string;
};

const ArticleTag = ({ text }: Props) => {
  return (
    <Button
      variant="ghost"
      border="3px solid black"
      borderRadius="10px"
      _hover={{ bg: '#000', color: '#e9e2dd' }}
      _even={{
        backgroundColor: '#000',
        color: '#e9e2dd',
      }}
    >
      {text}
    </Button>
  );
};

export default ArticleTag;
