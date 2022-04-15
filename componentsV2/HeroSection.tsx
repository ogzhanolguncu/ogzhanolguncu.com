import React from 'react';
import { Flex } from '@chakra-ui/react';

import HeroSectionTitle from './HeroSectionTitle';
import HeroSectionCode from './HeroSectionCode';

const HeroSection = () => {
  return (
    <Flex>
      <HeroSectionTitle />
      <HeroSectionCode />
    </Flex>
  );
};

export default HeroSection;
