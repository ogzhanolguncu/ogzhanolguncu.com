import { Heading, Flex, Box } from '@chakra-ui/react';
import Link from 'next/link';
import React, { PropsWithChildren } from 'react';

const ProjectContainer = ({
  children,
  bgGradient,
  title,
  link,
}: PropsWithChildren<{ title: string; link: string; bgGradient?: string }>) => {
  return (
    <Flex
      flexDirection="column"
      bgGradient={bgGradient}
      border="3px solid black"
      boxShadow="8px 8px #8080805e"
      borderRadius="10px"
      padding="1rem"
      width={['100%', '100%', '100%', '30%']}
      height={['300px', '200px', '200px', '300px']}
      gap="1.5rem"
    >
      <Heading
        as="h3"
        fontSize={['17px', '17px', '18px', '21px']}
        fontWeight="bold"
        letterSpacing="0.3px"
        lineHeight="30px"
      >
        <Link href={link}>{title}</Link>
      </Heading>
      <Box lineHeight="30px">{children}</Box>
    </Flex>
  );
};

export default ProjectContainer;
