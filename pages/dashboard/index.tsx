import { GetStaticProps } from 'next';
import React from 'react';
import { Flex, Heading, Spinner } from '@chakra-ui/core';
import { Blog } from 'global';
import { DashboardLatestArticleLists, DashboardLayout, Error401 } from '@components/index';
import { blogData } from 'sample-data';
import { useUser } from 'utils/hooks';

type Props = {
  blogs: Blog[];
};

function Dashboard({ blogs }: Props) {
  const user = useUser();
  if (user === null || user === undefined) return <Error401 />;
  if (!user)
    return (
      <Flex justifyContent="center" alignItems="center" height="100vh">
        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="#b83280" size="xl" />
      </Flex>
    );

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
