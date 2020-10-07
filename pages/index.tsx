import Head from 'next/head';
import { GetStaticProps } from 'next';
import { Layout, Project, Newsletter, ArticleLists, Summary } from '@components/index';
import { getSortedPostsData } from 'lib/posts';

import { StaticBlog } from 'global';

type Props = {
  blogPosts: StaticBlog[];
  popularPosts: StaticBlog[];
};

const Home = ({ blogPosts, popularPosts }: Props) => {
  return (
    <Layout>
      <Head>
        <title>Personal Blog</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Summary />
      <ArticleLists blogs={blogPosts} />
      <ArticleLists blogs={popularPosts} isPopular={true} />
      <Project />
      <Newsletter />
    </Layout>
  );
};

export default Home;

export const getStaticProps: GetStaticProps = async () => {
  const blogPosts = getSortedPostsData();
  const popularPosts = blogPosts.filter((blog) => blog.isPopular);
  return {
    props: { blogPosts, popularPosts },
  };
};
