import React from 'react';
import { Flex } from '@chakra-ui/react';

import ArticleHeader from './ArticleHeader';
import ArticleItem from './ArticleItem';
import type { StaticBlog } from 'global';

type Props = {
  articles: StaticBlog[];
  isPopular?: boolean;
  showHeader?: boolean;
  limitCount?: boolean;
};

const ArticleList = ({ articles, isPopular, showHeader = false, limitCount = false }: Props) => {
  return (
    <Flex flexDirection="column" color="#000" as="section">
      {showHeader && <ArticleHeader isPopular={isPopular} />}
      {articles.slice(0, limitCount ? 5 : -1).map((article) => (
        <ArticleItem
          key={article.id}
          articleId={article.id}
          articleDate={article.publishedAt}
          articleTitle={article.title}
          languageTags={article.languageTags}
          readingTime={article.readingTime}
        />
      ))}
    </Flex>
  );
};

export default ArticleList;
