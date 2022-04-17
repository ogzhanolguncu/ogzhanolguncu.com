import React from 'react';
import { Box } from '@chakra-ui/react';
import { InferGetStaticPropsType } from 'next';

import { getAllFilesFrontMatter } from 'lib/mdx';

import ArticleList from 'componentsV2/Article/ArticleList';
import Hero from 'componentsV2/Hero';
import Layout from 'componentsV2/Layout';

type Props = InferGetStaticPropsType<typeof getStaticProps>;

const Home = ({ blogPosts, popularPosts }: Props) => {
  return (
    <Layout>
      <Box mt={['5rem', '5rem', '10rem', '10rem']} />
      <Hero />
      <Box mt={['6rem', '6rem', '12rem', '12rem']} />
      <ArticleList articles={blogPosts} />
      <Box mt={['3rem', '3rem', '6rem', '6rem']} />
      <ArticleList articles={popularPosts} isPopular />
    </Layout>
  );
};

export default Home;

export const getStaticProps = async () => {
  const blogPosts = await getAllFilesFrontMatter('blog');

  const popularPosts = blogPosts.filter((blog) => blog.isPopular);
  return {
    props: { blogPosts, popularPosts },
  };
};
