import React, { useRef } from 'react';
import { Box, Flex, Img, Text } from '@chakra-ui/react';
import { TypeContainer } from './TypeContainer';
import useTypewritting from './hooks/useTypewritting';
import { CODE_USER_INFO } from './constants';

const HeroSectionCode = () => {
  const typeRef = useRef<any>(null);

  useTypewritting(typeRef);

  return (
    <Flex
      w="100%"
      flexDirection="column"
      justifyContent={['flex-start', 'flex-start', 'flex-end', 'flex-end']}
      alignItems={['flex-start', 'flex-start', 'flex-end', 'flex-end']}
    >
      <Box position="relative">
        <TypeContainer>
          <Box
            w={['300px', '200px', '300px', '400px']}
            height="450px"
            borderRadius="9px"
            background="black"
            boxShadow="6px 6px gray"
            padding="2rem"
          >
            <Box
              as="pre"
              ref={typeRef}
              color="#fff"
              visibility="hidden"
              fontSize={['1.2rem', '1rem', '1.5rem', '1.5rem']}
              fontFamily="Cabin"
            >
              {CODE_USER_INFO}
            </Box>
          </Box>
        </TypeContainer>
        <Box
          position="absolute"
          left={['50px', '50px', '-80px', '-80px']}
          bottom={['-60px', '-60px', '-80px', '-80px']}
          padding={['15px 20px', '15px 20px', '20px 30px', '30px 40px']}
          w={['260px', '260px', '340px', '340px']}
          borderRadius="10px"
          background="rgba(255, 255, 255, 0.27)"
          boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)"
          backdropFilter="blur(10.3px)"
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
              <Text fontWeight="normal" color="#d4cecd">
                Oğuzhan Olguncu
              </Text>
              <Text color="#1f2334">Developer, Lifetime learner</Text>
            </Flex>
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
};

export default HeroSectionCode;
