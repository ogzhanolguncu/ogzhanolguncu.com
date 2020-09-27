import { Box, Button, ButtonGroup, Flex, Heading, Text, useDisclosure } from '@chakra-ui/core';
import React, { useState } from 'react';
import ArticleDetailsModal from './ArticleDetailsModal';
import Link from 'next/link';

type Props = {
  // eslint-disable-next-line no-undef
  blogs: Blog[];
};

const DashboardArticle = ({ blogs }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [blogDetail, setBlogDetail] = useState(undefined);
  const [originalBlogs, setOriginalBlogs] = useState(blogs);

  const handleClick = (id: number) => {
    const blog: any = blogs.find((item) => {
      return id === item.id;
    });

    setBlogDetail(blog);
  };

  const handleDelete = (id: number) => {
    const newBlogs = originalBlogs.filter((item) => {
      return item.id !== id;
    });
    setOriginalBlogs(newBlogs);
  };

  return (
    <>
      <Flex w="100%" mt="20px" flexDirection="column">
        {originalBlogs.map((blog, index) => (
          <Flex
            justifyContent="space-between"
            alignItems="center"
            w="100%"
            backgroundColor="#F4F9FF"
            borderRadius="20px"
            p="10px 15px"
            key={index}
            mb="20px"
          >
            <Text>{blog.date}</Text>
            <Heading as="h6" size="xs">
              {blog.title.slice(0, 40) + '...'}
            </Heading>
            <Box>
              <ButtonGroup>
                <Button
                  onClick={() => {
                    onOpen(), handleClick(blog.id);
                  }}
                  leftIcon={'link'}
                  variantColor="pink"
                  variant="solid"
                  mr="10px"
                >
                  Details
                </Button>
                <Button leftIcon={'edit'} variantColor="blue" variant="solid">
                  <Link
                    href="/admin/dashboard/article/[id]"
                    as={`/admin/dashboard/article/${blog.id}`}
                  >
                    Update
                  </Link>
                </Button>
                <Button
                  onClick={() => {
                    handleDelete(blog.id);
                  }}
                  leftIcon={'delete'}
                  variantColor="red"
                  variant="solid"
                >
                  Delete
                </Button>
              </ButtonGroup>
              {isOpen ? (
                <ArticleDetailsModal isOpen={isOpen} onClose={onClose} blog={blogDetail} />
              ) : null}
            </Box>
          </Flex>
        ))}
      </Flex>
    </>
  );
};

export default DashboardArticle;
