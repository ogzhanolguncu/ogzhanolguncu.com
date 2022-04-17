import React from 'react';
import { Flex } from '@chakra-ui/react';

import ArticleHeader from './ArticleHeader';
import ArticleItem from './ArticleItem';

const ArticleList = () => {
  return (
    <Flex flexDirection="column" color="#000" as="section">
      <ArticleHeader />
      <ArticleItem
        articleDate="Feb 21, 2022"
        articleTitle=" How Does “prevState” Works Under the Hood"
      />
    </Flex>
  );
};

export default ArticleList;
