import React from 'react';
import { Flex, Heading, Text } from '@chakra-ui/react';

import ArticleTag from './ArticleTag';
import { Underline } from 'componentsV2/Underline';

type Props = {
  articleDate: Date | string;
  articleTitle: string;
};

const ArticleItem = ({ articleDate, articleTitle }: Props) => {
  return (
    <Flex
      mt="35px"
      alignItems="center"
      justifyContent="space-between"
      flexDirection={['column', 'column', 'row', 'row']}
    >
      <Flex flexDirection="column">
        <Text fontSize="12px" fontWeight="bold" letterSpacing="0.05px">
          {articleDate}
        </Text>
        <Heading as="h3" fontSize="21px" fontWeight="bold" letterSpacing="0.05px">
          <Underline>{articleTitle}</Underline>
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
