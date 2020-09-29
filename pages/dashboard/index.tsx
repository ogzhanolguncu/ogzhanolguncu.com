import { GetStaticProps } from 'next';
import React from 'react';
import { Flex, Heading } from '@chakra-ui/core';
import { Blog } from 'global';
import { DashboardLatestArticleLists, DashboardLayout } from '@components/index';
import { blogData } from 'sample-data';
import useUser from 'utils/hooks';

type Props = {
  blogs: Blog[];
};

function Dashboard({ blogs }: Props) {
  useUser();
  return (
    <>
      <DashboardLayout>
        <Flex flexDirection="column" w="60%">
          <Heading fontSize="20px" fontWeight="700" textTransform="uppercase">
            Latest added articles
          </Heading>
          <DashboardLatestArticleLists blogs={blogs} />
        </Flex>
      </DashboardLayout>
    </>
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
