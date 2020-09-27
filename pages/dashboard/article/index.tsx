import { Button, Flex, Heading } from '@chakra-ui/core';
import DashboardArticle from '@components/Dashboard/DashboardArticle';
import DashboardLayout from '@components/Dashboard/DashboardLayout';

import React from 'react';
import { blogData } from 'sample-data';
import { GetStaticProps } from 'next';
import { Blog } from 'global';
import Link from 'next/link';

type Props = {
  blogs: Blog[];
};

const article = ({ blogs }: Props) => {
  return (
    <DashboardLayout>
      <Flex flexDirection="column" w="100%">
        <Flex justifyContent="space-between">
          <Heading fontSize="20px" fontWeight="700" textTransform="uppercase">
            Articles
          </Heading>
          <Button variantColor="blue" variant="outline" mr="4">
            <Link href="/dashboard/article/add">Add</Link>
          </Button>
        </Flex>
        <DashboardArticle blogs={blogs} />
      </Flex>
    </DashboardLayout>
  );
};

export default article;

export const getStaticProps: GetStaticProps = async () => {
  const popular = true;
  const blogs = blogData;
  return {
    props: { popular, blogs },
  };
};
