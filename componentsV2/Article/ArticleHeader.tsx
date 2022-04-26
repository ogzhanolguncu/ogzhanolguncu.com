import React from 'react';
import Link from 'next/link';
import { Flex, Heading } from '@chakra-ui/react';

import NavigationButton from 'componentsV2/Navbar/NavigationButton';

type Props = {
  isPopular?: boolean;
};

const ArticleHeader = ({ isPopular }: Props) => {
  return (
    <Flex alignItems="center">
      <Heading fontSize={['20px', '20px', '24px', '30px']} fontWeight="bold" mr="45px">
        {isPopular ? 'Popular Articles' : 'Latest Articles'}
      </Heading>
      <NavigationButton LinkComponent={Link} href="/blog" text="View All" />
    </Flex>
  );
};

export default ArticleHeader;
