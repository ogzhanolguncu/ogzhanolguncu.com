import { Box } from '@chakra-ui/react';
import HeroSection from 'componentsV2/HeroSection';
import Layout from 'componentsV2/Layout';
import React from 'react';

const Home = () => {
  return (
    <Layout>
      <Box mt="10rem" />
      <HeroSection />
    </Layout>
  );
};

export default Home;
