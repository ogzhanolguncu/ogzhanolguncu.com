import React from 'react';
import { Flex } from '@chakra-ui/react';

import HeroSectionTitle from './HeroSectionTitle';
import HeroSectionCode from './HeroSectionCode';

const HeroSection = () => {
  return (
    <Flex flexDirection={['column', 'column', 'row', 'row']}>
      <HeroSectionTitle />
      <HeroSectionCode />
    </Flex>
  );
};

export default HeroSection;
