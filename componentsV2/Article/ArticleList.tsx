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
  const articleList = limitCount ? articles.slice(0, 5) : articles;
  return (
    <Flex flexDirection="column" as="section" color='gray.800'>
      {showHeader && <ArticleHeader isPopular={isPopular} />}
      {articleList.map((article) => (
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
