import React from 'react';
import { Flex, Heading, Text } from '@chakra-ui/react';
import Link from 'next/link';

import ArticleTag from './ArticleTag';
import { useRouter } from 'next/router';

type Props = {
  articleDate: Date | string;
  articleTitle: string;
  languageTags: string[];
  articleId: string;
  readingTime: string;
};

const ArticleItem = ({
  articleDate,
  articleTitle,
  languageTags,
  articleId,
  readingTime,
}: Props) => {
  const router = useRouter();

  return (
    <Flex
      mt="35px"
      alignItems="flex-start"
      justifyContent="space-between"
      flexDirection={['column', 'column', 'column', 'row']}
      gap="0 1.5rem"
    >
      <Flex flexDirection="column">
        <Text fontSize="12px" fontWeight="bold" letterSpacing="0.05px">
          {articleDate}
        </Text>
        <Flex flexDirection="column">
          <Heading
            as="h3"
            fontSize={['17px', '17px', '18px', '21px']}
            fontWeight="bold"
            letterSpacing="0.05px"
            _hover={{
              textDecorationThickness: '3px',
              textUnderlineOffset: '2px',
              textDecoration: 'underline',
            }}
            my="0.3rem"
          >
            <Link href={`/blog/${articleId}`}>{articleTitle}</Link>
          </Heading>
          <Text fontSize="12px" fontWeight="bold" letterSpacing="0.05px" textAlign="start">
            Reading Time: {readingTime}
          </Text>
        </Flex>
      </Flex>
      <Flex gap="1rem" mt="13px" flexWrap={['wrap', 'wrap', 'nowrap', 'nowrap']}>
        {languageTags.map((language) => (
          <ArticleTag
            key={language}
            text={language}
            onClick={() =>
              router.push({
                pathname: '/blog/',
                query: { tag: language },
              })
            }
          />
        ))}
      </Flex>
    </Flex>
  );
};

export default ArticleItem;
