import Head from 'next/head';
import { GetStaticProps } from 'next';
import { Layout, Project, Newsletter, ArticleLists, Summary } from '@components/index';
import { blogData } from 'sample-data';
import { Blog, IsPopular } from 'global';

type Props = {
  isPopular?: IsPopular;
  blogs: Blog[];
};

const Home = ({ isPopular, blogs }: Props) => {
  return (
    <Layout>
      <Head>
        <title>Personal Blog</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Summary />
      <ArticleLists blogs={blogs} />
      <ArticleLists isPopular={isPopular} blogs={blogs} />
      <Project />
      <Newsletter />
    </Layout>
  );
};

export default Home;

export const getStaticProps: GetStaticProps = async () => {
  const popular = true;
  const blogs = blogData;

  return {
    props: { popular, blogs },
  };
};
