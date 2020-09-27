import { Flex, Heading, Input, Stack, Tag } from '@chakra-ui/core';
import { DashboardLayout } from '@components/index';
import React, { useEffect, useState } from 'react';
import colorMap from 'styles/colorMap';

const Add = () => {
  const [suggest, setSuggest] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (suggest?.length >= 1) {
      setTags(Object.keys(colorMap).filter((colors) => colors.startsWith(suggest)));
    }
    return () => {
      setTags([]);
    };
  }, [suggest]);

  return (
    <DashboardLayout>
      <Flex flexDirection="column" w="60%">
        <Flex justifyContent="space-between">
          <Heading fontSize="15px" fontWeight="600">
            Write a new article
          </Heading>
          {selectedTags?.length > 0 && (
            <Stack isInline>
              {selectedTags.map((tag, index) => (
                <Tag
                  key={index}
                  _hover={{ cursor: 'pointer' }}
                  onClick={() => setSelectedTags([...selectedTags, tag])}
                >
                  {tag}
                </Tag>
              ))}
            </Stack>
          )}
        </Flex>
        <Stack spacing={3} marginTop="2rem">
          <Input
            variant="filled"
            placeholder="New post title here..."
            fontSize="2.25rem"
            height="46px"
            whiteSpace="pre-wrap"
            fontWeight="800"
            lineHeight="1.25"
          />
          <Input
            variant="unstyled"
            placeholder="Pick at least 4 tags..."
            fontSize="1rem"
            height="24px"
            whiteSpace="pre-wrap"
            fontWeight="800"
            lineHeight="1.5"
            p="16px"
            onChange={(e: React.FormEvent<HTMLInputElement>) => setSuggest(e.currentTarget.value)}
          />
          {tags?.length > 0 && (
            <Stack isInline>
              {tags.map((tag, index) => (
                <Tag
                  key={index}
                  _hover={{ cursor: 'pointer' }}
                  onClick={() => setSelectedTags([...selectedTags, tag])}
                >
                  {tag}
                </Tag>
              ))}
            </Stack>
          )}
        </Stack>
      </Flex>
    </DashboardLayout>
  );
};

export default Add;
