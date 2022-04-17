import React from 'react';
import { Flex } from '@chakra-ui/react';

import ArticleHeader from './ArticleHeader';
import ArticleItem from './ArticleItem';
import type { StaticBlog } from 'global';

type Props = {
  articles: StaticBlog[];
  isPopular?: boolean;
};

const ArticleList = ({ articles }: Props) => {
  return (
    <Flex flexDirection="column" color="#000" as="section">
      <ArticleHeader isPopular />
      {articles.slice(0, 5).map((article) => (
        <ArticleItem
          key={article.id}
          articleId={article.id}
          articleDate={article.publishedAt}
          articleTitle={article.title}
          languageTags={article.languageTags}
        />
      ))}
    </Flex>
  );
};

export default ArticleList;
