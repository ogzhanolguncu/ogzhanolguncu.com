import React, { useRef } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { TypeContainer } from './TypeContainer';
import useTypewritting from './hooks/useTypewritting';
import { CODE_USER_INFO } from './constants';
import Image from 'next/image';

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
        <Box
          w={['300px', '400px', '300px', '400px']}
          height="450px"
          borderRadius="9px"
          background="black"
          boxShadow="6px 6px #8080805e"
          padding="2rem"
        >
          <Box
            as="pre"
            // ref={typeRef}
            color="#fff"
            // visibility="hidden"
            fontSize={['1.2rem', '1.2rem', '1.5rem', '1.5rem']}
            fontFamily="Cabin"
          >
            {/* {CODE_USER_INFO} */}
            <Flex>
              <Text color="#c0ad60">const </Text> <Text>userInfo</Text> <Text>: {'{'} </Text>
            </Flex>
            <Flex ml="3.8rem">
              <Text>name: </Text> &#39;<Text color="rgba(253, 149, 90, 0.8)">Oguzhan</Text>
              &#39; ,
            </Flex>
            <Flex ml="3.8rem">
              <Text>surname: </Text> &#39;<Text color="rgba(253, 149, 90, 0.8)">Olguncu</Text>
              &#39; ,
            </Flex>
            <Flex ml="3.8rem">
              <Text>location: </Text> &#39;
              <Text color="rgba(253, 149, 90, 0.8)">Istanbul/Turkey</Text>
              &#39; ,
            </Flex>
            <Flex ml="3.8rem">
              <Text>technologies: </Text> <Text>{'['} </Text>
            </Flex>
            <Flex ml="1.5rem">
              &#39;<Text color="rgba(253, 149, 90, 0.8)">Javascript</Text>&#39;,
            </Flex>
            <Flex ml="1.5rem">
              &#39;<Text color="rgba(253, 149, 90, 0.8)">Typescript</Text>&#39;,
            </Flex>
            <Flex ml="1.5rem">
              &#39;<Text color="rgba(253, 149, 90, 0.8)">React</Text>&#39;{']'}
            </Flex>
            <Flex>
              <Text>{'};'}</Text>
            </Flex>
          </Box>
        </Box>
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
            <Image
              style={{ borderRadius: '50%' }}
              src={'/static/images/colored.webp'}
              alt="Profile Photo Oğuzhan Olguncu"
              loading="eager"
              placeholder="empty"
              width="90px"
              height="90px"
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
