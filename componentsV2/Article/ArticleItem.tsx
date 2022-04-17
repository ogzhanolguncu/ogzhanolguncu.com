import React from 'react';
import { Flex, Heading, Text } from '@chakra-ui/react';

import ArticleTag from './ArticleTag';

type Props = {
  articleDate: Date | string;
  articleTitle: string;
};

const ArticleItem = ({ articleDate, articleTitle }: Props) => {
  return (
    <Flex mt="35px" alignItems="center" justifyContent="space-between">
      <Flex flexDirection="column">
        <Text fontSize="12px" fontWeight="bold" letterSpacing="0.05px">
          {articleDate}
        </Text>
        <Heading
          as="h3"
          fontSize="20px"
          fontWeight="bold"
          letterSpacing="0.05px"
          textDecoration="underline 3px"
          textUnderlineOffset="5px"
        >
          {articleTitle}
        </Heading>
      </Flex>
      <Flex gap="1rem" mt="8px">
        <ArticleTag text="React" />
        <ArticleTag text="Typescript" />
        <ArticleTag text="Webpack" />
      </Flex>
    </Flex>
  );
};

export default ArticleItem;
