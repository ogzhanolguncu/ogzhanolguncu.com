import { Flex, Link as StyledLink, Text, Box, useColorMode } from '@chakra-ui/react';

import { useContext } from 'react';
import { ColorModeContext } from '@contexts/CustomColorContext';

type Props = {
  unicodeIcon: string;
  leftSide: string;
  rightSide: string;
  redirectUrl: string;
};

const ProjectItems = ({ unicodeIcon, leftSide, rightSide, redirectUrl }: Props) => {
  const colorModeObj = useContext(ColorModeContext);
  const { colorMode } = useColorMode();
  return (
    <StyledLink
      _hover={{
        textDecoration: 'none',
        bg: colorMode === 'light' ? '#f6f8fb' : '#10151fbf',
        transition: 'all 0.1s ease-in',
      }}
      m="auto -1rem"
      borderRadius="20px"
      padding=".5rem 2rem"
      href={redirectUrl}
    >
      <Flex flexDirection={['column', 'column', 'row', 'row']}>
        <Flex flex="1">
          <Box h="10" mr="0.8rem" fontSize="1.15rem" d="flex" alignItems="center">
            {unicodeIcon}
          </Box>
          <Text h="10" fontSize="1.15rem" fontWeight="bold" d="flex" alignItems="center">
            {leftSide}
          </Text>
        </Flex>
        <Text
          h="10"
          flex="3"
          fontSize="1.1rem"
          fontWeight="400"
          color={colorModeObj.publishedDateColor[colorMode]}
          d="flex"
          alignItems="center"
        >
          {rightSide}
        </Text>
      </Flex>
    </StyledLink>
  );
};

export default ProjectItems;
