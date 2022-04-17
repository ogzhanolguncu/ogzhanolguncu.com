import React from 'react';
import { Flex } from '@chakra-ui/react';

import HeroSectionTitle from './HeroTitle';
import HeroSectionCode from './HeroCode';

const HeroSection = () => {
  return (
    <Flex flexDirection={['column', 'column', 'row', 'row']} as="section">
      <HeroSectionTitle />
      <HeroSectionCode />
    </Flex>
  );
};

export default HeroSection;
