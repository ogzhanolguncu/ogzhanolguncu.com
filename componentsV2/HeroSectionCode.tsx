import React from 'react';
import { Box, Code, Flex, Img, Text } from '@chakra-ui/react';

const data = {
  menu: {
    id: 'file',
    value: 'File',
    popup: {
      menuitem: [
        { value: 'New', onclick: 'CreateNewDoc()' },
        { value: 'Open', onclick: 'OpenDoc()' },
        { value: 'Close', onclick: 'CloseDoc()' },
      ],
    },
  },
};

const HeroSectionCode = () => {
  return (
    <Flex w="100%" flexDirection="column" justifyContent="flex-end" alignItems="flex-end">
      <Box position="relative">
        <Code
          w="400px"
          borderRadius="9px"
          background="black"
          color="#fff"
          boxShadow="6px 6px gray"
          padding="1rem"
        >
          {JSON.stringify(data, null, 2)}
        </Code>
        <Box
          position="absolute"
          left="-80px"
          bottom="-80px"
          padding="30px 40px"
          backgroundColor="rgba(255, 255, 255, 0.35)"
          w="340px"
          borderRadius="10px"
          backdropFilter="blur(10px)"
        >
          <Flex>
            <Img
              borderRadius="50%"
              w="90px"
              height="90px"
              src={'/static/images/coloredProfileImage.jpeg'}
              alt="Profile Photo Oğuzhan Olguncu"
            />
            <Flex ml="28px" flexDirection="column" justifyContent="center" alignItems="flex-start">
              <Text fontWeight="normal">Oğuzhan Olguncu</Text>
              <Text color="#A49995">Developer</Text>
            </Flex>
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
};

export default HeroSectionCode;
