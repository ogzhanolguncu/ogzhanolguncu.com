import React from 'react';
import { Button } from '@chakra-ui/react';

type Props = {
  text: string;
};

const randomBoolean = () => Math.random() >= 0.5;

const ArticleTag = ({ text }: Props) => {
  return (
    <Button
      fontSize={['13px', '13px', '14px', '16px']}
      variant="ghost"
      border="3px solid black"
      borderRadius="10px"
      _hover={{ bg: '#000', color: '#e9e2dd' }}
      _even={
        randomBoolean()
          ? {
              backgroundColor: '#000',
              color: '#e9e2dd',
            }
          : {}
      }
      _odd={
        randomBoolean()
          ? {
              backgroundColor: '#000',
              color: '#e9e2dd',
            }
          : {}
      }
    >
      {text}
    </Button>
  );
};

export default ArticleTag;
