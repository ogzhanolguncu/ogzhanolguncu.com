import Head from 'next/head';
import { GetStaticProps } from 'next';
import { Layout, Project, Newsletter, ArticleLists, Summary } from '@components/index';
// import { frontMatter as blogPosts } from './blog/**/*.mdx';
import { getSortedPostsData } from 'lib/posts';

import { StaticBlog } from 'global';

type Props = {
  blogPosts: StaticBlog[];
};

const Home = ({ blogPosts }: Props) => {
  return (
    <Layout>
      <Head>
        <title>Personal Blog</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Summary />
      <ArticleLists blogs={blogPosts} />
      <ArticleLists blogs={blogPosts} />
      <Project />
      <Newsletter />
    </Layout>
  );
};

export default Home;

export const getStaticProps: GetStaticProps = async () => {
  const isPopular = true;
  const blogPosts = getSortedPostsData();
  return {
    props: { isPopular, blogPosts },
  };
};
