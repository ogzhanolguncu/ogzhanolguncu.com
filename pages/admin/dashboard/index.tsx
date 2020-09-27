import { Flex, Heading } from '@chakra-ui/core';

import DashboardLayout from '@components/Dashboard/DashboardLayout';
import DashboardLatestArticleLists from '@components/Dashboard/DashboardLatestArticleLists';

// import data from 'data.json';
import { blogData } from 'sample-data';
import { GetStaticProps } from 'next';

type Props = {
  // eslint-disable-next-line no-undef
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
