import React from 'react';
import { Flex, Text } from '@chakra-ui/react';
import { BlinkContainer } from './BlinkContainer';

const Codes = () => {
  return (
    <>
      <Flex>
        <Text color="#c0ad60" mr="8px">
          const
        </Text>
        <Text> userInfo</Text> <Text>: {'{'} </Text>
      </Flex>
      <Flex ml={['2rem', '2rem', '4rem', '4rem']}>
        <Text mr="5px">name: </Text> &#39;
        <Text color="rgba(253, 139, 90, 0.8)">Oguzhan</Text>
        &#39; ,
      </Flex>
      <Flex ml={['2rem', '2rem', '4rem', '4rem']}>
        <Text mr="5px">surname: </Text> &#39;
        <Text color="rgba(253, 139, 90, 0.8)">Olguncu</Text>
        &#39; ,
      </Flex>
      <Flex ml={['2rem', '2rem', '4rem', '4rem']}>
        <Text mr="5px">location: </Text> &#39;
        <Text color="rgba(253, 149, 90, 0.8)">Istanbul/Turkey</Text>
        &#39;,
      </Flex>
      <Flex ml={['2rem', '2rem', '4rem', '4rem']}>
        <Text mr="5px">technologies: </Text> <Text>{'['} </Text>
      </Flex>
      <Flex ml={['0.8rem', '0.8rem', '1.5rem', '1.5rem']}>
        &#39;<Text color="rgba(253, 149, 90, 0.8)">Javascript</Text>&#39;,
      </Flex>
      <Flex ml={['0.8rem', '0.8rem', '1.5rem', '1.5rem']}>
        &#39;<Text color="rgba(253, 149, 90, 0.8)">Typescript</Text>&#39;,
      </Flex>
      <Flex ml={['0.8rem', '0.8rem', '1.5rem', '1.5rem']}>
        &#39;<Text color="rgba(253, 149, 90, 0.8)">React</Text>&#39;{' ]'}
      </Flex>
      <Flex>
        <Text>{'};'}</Text>
        <BlinkContainer />
      </Flex>
    </>
  );
};

export default Codes;
