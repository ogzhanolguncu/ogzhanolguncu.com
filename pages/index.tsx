import Head from 'next/head';
import { GetStaticProps } from 'next';
import { Layout, Project, Newsletter, ArticleLists, Summary } from '@components/index';
// import { frontMatter as blogPosts } from './blog/**/*.mdx';
import { getSortedPostsData } from 'lib/posts';

import { Blog, IsPopular } from 'global';

type Props = {
  isPopular?: IsPopular;
  blogPosts: Blog[];
};

const Home = ({ isPopular, blogPosts }: Props) => {
  return (
    <Layout>
      <Head>
        <title>Personal Blog</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Summary />
      <ArticleLists blogs={blogPosts} />
      <ArticleLists isPopular={isPopular} blogs={blogPosts} />
      <Project />
      <Newsletter />
    </Layout>
  );
};

export default Home;

export const getStaticProps: GetStaticProps = async () => {
  const popular = true;
  const blogs = getSortedPostsData();
  return {
    props: { popular, blogs },
  };
};
