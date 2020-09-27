import { Button, Flex, Heading, Text } from '@chakra-ui/core';
import React from 'react';

type Props = {
  // eslint-disable-next-line no-undef
  blogs: Blog[];
};

const DashboardLatestArticleLists = ({ blogs }: Props) => {
  return (
    <Flex w="100%" mt="20px" flexDirection="column">
      {blogs.map((blog, index) => (
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
          <Button leftIcon={'link'} variantColor="pink" variant="solid">
            Details
          </Button>
        </Flex>
      ))}
    </Flex>
  );
};

export default DashboardLatestArticleLists;
