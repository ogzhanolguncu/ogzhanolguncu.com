import { Flex, Link as StyledLink, Text, Box } from '@chakra-ui/core';

type Props = {
  colorMode: string;
  unicodeIcon: string;
  leftSide: string;
  rightSide: string;
  redirectUrl: string;
};

const ProjectItems = ({ colorMode, unicodeIcon, leftSide, rightSide, redirectUrl }: Props) => {
  return (
    <StyledLink
      _hover={{
        textDecoration: 'none',
        bg: colorMode === 'light' ? '#f6f8fb' : '#10151fbf',
        transition: 'all 0.1s ease-in',
      }}
      m="auto -1rem"
      borderRadius="20px"
      padding=".5rem 1rem"
      href={redirectUrl}
    >
      <Flex flexDirection={['column', 'column', 'row', 'row']}>
        <Flex flex="1">
          <Box h="10" mr="0.8rem" fontSize="1.15rem">
            {unicodeIcon}
          </Box>
          <Text h="10" fontSize="1.15rem" fontWeight="bold">
            {leftSide}
          </Text>
        </Flex>
        <Text h="10" flex="3" fontSize="1.1rem" fontWeight="400" color="#787f87">
          {rightSide}
        </Text>
      </Flex>
    </StyledLink>
  );
};

export default ProjectItems;
