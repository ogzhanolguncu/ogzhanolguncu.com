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
    <Flex
      w="100%"
      flexDirection="column"
      justifyContent={['flex-start', 'flex-start', 'flex-end', 'flex-end']}
      alignItems={['flex-start', 'flex-start', 'flex-end', 'flex-end']}
    >
      <Box position="relative">
        <Code
          w={['300px', '200px', '300px', '400px']}
          borderRadius="9px"
          background="black"
          color="#fff"
          boxShadow="6px 6px gray"
          padding="1rem"
          fontSize={['9px', '9px', '12px', '14px']}
        >
          {JSON.stringify(data, null, 2)}
        </Code>
        <Box
          position="absolute"
          left={['unset', 'unset', '-80px', '-80px']}
          right={['-25px', '-25px', 'unset', 'unset']}
          bottom={['unset', 'unset', '-80px', '-80px']}
          top={['-25px', '-25px', 'unset', 'unset']}
          padding={['15px 20px', '15px 20px', '20px 30px', '30px 40px']}
          backgroundColor="rgba(255, 255, 255, 0.35)"
          w={['200px', '200px', '340px', '340px']}
          borderRadius="10px"
          backdropFilter="blur(10px)"
        >
          <Flex>
            <Img
              borderRadius="50%"
              w={['45px', '45px', '65px', '90px']}
              h={['45px', '45px', '65px', '90px']}
              src={'/static/images/coloredProfileImage.jpeg'}
              alt="Profile Photo Oğuzhan Olguncu"
            />
            <Flex ml="28px" flexDirection="column" justifyContent="center" alignItems="flex-start">
              <Text fontWeight="normal" color="#000">
                Oğuzhan Olguncu
              </Text>
              <Text color="#A49995">Developer</Text>
            </Flex>
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
};

export default HeroSectionCode;
