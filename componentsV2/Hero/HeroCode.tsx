import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import Image from 'next/image';
import TypeIt from 'typeit-react';

import { CodeContainer } from './CodeContainer';
import Codes from './Codes';

const HeroSectionCode = () => {
  return (
    <Flex
      w="100%"
      flexDirection="column"
      justifyContent={['flex-start', 'flex-start', 'flex-end', 'flex-end']}
      alignItems={['flex-start', 'flex-start', 'flex-end', 'flex-end']}
    >
      <Box position="relative">
        <Box
          w={['300px', '400px', '300px', '400px']}
          height="450px"
          borderRadius="9px"
          background="black"
          boxShadow="6px 6px #8080805e"
          padding="2rem"
          color="#fff"
          fontSize={['1.2rem', '1.5rem', '1.5rem', '1.5rem']}
          fontFamily="Cabin"
        >
          <CodeContainer>
            <TypeIt
              options={{
                cursor: false,
                speed: 50,
                lifeLike: true,
                loop: true,
              }}
            >
              <Codes />
            </TypeIt>
          </CodeContainer>
        </Box>
        <Box
          position="absolute"
          left={['20px', '60px', '-80px', '-80px']}
          bottom={['-60px', '-60px', '-80px', '-80px']}
          padding={['15px 20px', '15px 20px', '20px 30px', '30px 40px']}
          w={['300px', '300px', '340px', '340px']}
          borderRadius="10px"
          background="rgba(255, 255, 255, 0.27)"
          boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)"
          backdropFilter="blur(10.3px)"
        >
          <Flex>
            <Image
              style={{ borderRadius: '50%' }}
              src={'/static/images/colored.webp'}
              alt="Profile Photo Oğuzhan Olguncu"
              loading="eager"
              placeholder="empty"
              width={90}
              height={90}
              priority
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
