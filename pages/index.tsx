import { Box } from '@chakra-ui/react';
import ArticleList from 'componentsV2/Article/ArticleList';
import Hero from 'componentsV2/Hero';
import Layout from 'componentsV2/Layout';
import React from 'react';

const Home = () => {
  return (
    <Layout>
      <Box mt={['5rem', '5rem', '10rem', '10rem']} />
      <Hero />
      <Box mt={['6rem', '6rem', '12rem', '12rem']} />
      <ArticleList />
    </Layout>
  );
};

export default Home;
