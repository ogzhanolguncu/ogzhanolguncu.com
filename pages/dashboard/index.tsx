import { Flex, Heading } from '@chakra-ui/core';

import { blogData } from 'sample-data';
import { GetStaticProps } from 'next';
import { Blog } from 'global';
import React from 'react';
import { DashboardLatestArticleLists, DashboardLayout } from '@components/index';

type Props = {
  blogs: Blog[];
};

function Dashboard({ blogs }: Props) {
  return (
    <DashboardLayout>
      <Flex flexDirection="column" w="60%">
        <Heading fontSize="20px" fontWeight="700" textTransform="uppercase">
          Latest added articles
        </Heading>
        <DashboardLatestArticleLists blogs={blogs} />
      </Flex>
    </DashboardLayout>
  );
}

export default Dashboard;

export const getStaticProps: GetStaticProps = async () => {
  const popular = true;
  const blogs = blogData.slice(Math.max(blogData.length - 3, 0));

  return {
    props: { popular, blogs },
  };
};
