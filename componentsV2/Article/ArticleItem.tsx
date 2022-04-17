import React from 'react';
import { Flex, Heading, Text } from '@chakra-ui/react';

import ArticleTag from './ArticleTag';
import { Underline } from 'componentsV2/Article/Underline';
import Link from 'next/link';

type Props = {
  articleDate: Date | string;
  articleTitle: string;
  languageTags: string[];
  articleId: string;
};

const ArticleItem = ({ articleDate, articleTitle, languageTags, articleId }: Props) => {
  return (
    <Flex
      mt="35px"
      alignItems="flex-start"
      justifyContent="space-between"
      flexDirection={['column', 'column', 'column', 'row']}
    >
      <Flex flexDirection="column" width="100%">
        <Text fontSize="12px" fontWeight="bold" letterSpacing="0.05px">
          {articleDate}
        </Text>
        <Flex>
          <Heading
            as="h3"
            fontSize={['15px', '15px', '18px', '21px']}
            fontWeight="bold"
            letterSpacing="0.05px"
          >
            <Underline>
              <Link href={`/blog/${articleId}`}>{articleTitle}</Link>
            </Underline>
          </Heading>
        </Flex>
      </Flex>
      <Flex gap="1rem" mt="8px" flexWrap={['wrap', 'wrap', 'nowrap', 'nowrap']}>
        {languageTags.map((language) => (
          <ArticleTag key={language} text={language} />
        ))}
      </Flex>
    </Flex>
  );
};

export default ArticleItem;
