import Link from 'next/link';
import React from 'react';
import { Flex, Heading } from '@chakra-ui/react';
import NavigationButton from 'componentsV2/Navbar/NavigationButton';

const ArticleHeader = () => {
  return (
    <Flex>
      <Heading fontSize="30px" fontWeight="bold" mr="45px">
        Latest Articles
      </Heading>
      <NavigationButton LinkComponent={Link} href="/blog" text="View All" />
    </Flex>
  );
};

export default ArticleHeader;
