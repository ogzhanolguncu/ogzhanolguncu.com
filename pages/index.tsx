import Head from 'next/head';
import { GetStaticProps } from 'next';

import { Layout, Project, Newsletter, ArticleLists, Summary } from '@components/index';
import data from 'data.json';

import React from 'react';

type Props = {
  // eslint-disable-next-line no-undef
  isPopular?: IsPopular;
  // eslint-disable-next-line no-undef
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
  const blogs = data.Blogs;
  return {
    props: { popular, blogs },
  };
};
