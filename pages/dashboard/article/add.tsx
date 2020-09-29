import React, { useEffect, useState } from 'react';
import {
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  Textarea,
  Text,
} from '@chakra-ui/core';
import { DashboardLayout } from '@components/index';
import colorMap from 'styles/colorMap';
import ReactMarkdown from 'react-markdown';

const Add = () => {
  const [suggest, setSuggest] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [articleContent, setArticleContent] = useState<string>(``);
  const [togglePreview, setTogglePreview] = useState<boolean>(false);

  const handleDeleteTag = (tag: string) => {
    const newSelectedTags = selectedTags.filter((item) => {
      return tag !== item;
    });
    setSelectedTags(newSelectedTags);
  };

  useEffect(() => {
    if (suggest?.length >= 1) {
      const searched = Object.keys(colorMap)
        .filter((colors) => colors.startsWith(suggest))
        .filter((item) => {
          let condition = false;
          for (let i = 0; i < selectedTags.length; i++) {
            item === selectedTags[i] ? (condition = true) : null;
          }
          if (condition) {
            return null;
          } else {
            return item;
          }
        });

      setTags(searched);
    }
    return () => {
      setTags([]);
    };
  }, [suggest]);

  return (
    <DashboardLayout>
      <Flex flexDirection="column" w="80%">
        <Flex justifyContent="space-between">
          <Heading
            fontWeight="600"
            paddingLeft="1rem"
            fontSize="1.5rem"
            height="24px"
            whiteSpace="pre-wrap"
            lineHeight="1.5"
          >
            Write a new article
          </Heading>
          {selectedTags?.length > 0 && (
            <Stack isInline>
              {selectedTags.map((tag, index) => (
                <Tag key={index} _hover={{ cursor: 'pointer' }}>
                  <TagLabel>{tag}</TagLabel>
                  <TagCloseButton onClick={() => handleDeleteTag(tag)} />
                </Tag>
              ))}
            </Stack>
          )}
          <Button
            variantColor="blue"
            variant="outline"
            onClick={() => setTogglePreview(!togglePreview)}
          >
            Preview
          </Button>
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
          {tags?.length > 0 && selectedTags.length !== 4 && (
            <Stack isInline>
              {tags.map((tag, index) => (
                <Tag
                  key={index}
                  _hover={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedTags([...selectedTags, tag]);
                    setSuggest('');
                  }}
                >
                  {tag}
                </Tag>
              ))}
            </Stack>
          )}
          <Text>
            <ReactMarkdown source={articleContent} />
          </Text>
          <Textarea
            placeholder="Start typing"
            fontWeight="500"
            backgroundColor="#EDF2F7"
            height="425px"
            onBlur={(e: React.FormEvent<HTMLInputElement>) =>
              setArticleContent(e.currentTarget.value)
            }
          />
        </Stack>
      </Flex>
    </DashboardLayout>
  );
};

export default Add;
