import { Flex, Heading } from '@chakra-ui/core';
import DashboardArticle from '@components/Dashboard/DashboardArticle';
import DashboardLayout from '@components/Dashboard/DashboardLayout';

import React from 'react';
import { blogData } from 'sample-data';
import { GetStaticProps } from 'next';

type Props = {
  // eslint-disable-next-line no-undef
  blogs: Blog[];
};

const article = ({ blogs }: Props) => {
  return (
    <DashboardLayout>
      <Flex flexDirection="column" w="100%">
        <Heading fontSize="20px" fontWeight="700" textTransform="uppercase">
          Articles
        </Heading>
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
