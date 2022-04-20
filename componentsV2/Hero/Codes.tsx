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
        <Text mr="8px"> userInfo = </Text> <Text> {' {'} </Text>
      </Flex>
      <Flex ml={['2rem', '2rem', '4rem', '4rem']}>
        <Text mr="5px">name: </Text> &#39;
        <Text color="codeColor">Oguzhan</Text>
        &#39; ,
      </Flex>
      <Flex ml={['2rem', '2rem', '4rem', '4rem']}>
        <Text mr="5px">surname: </Text> &#39;
        <Text color="codeColor">Olguncu</Text>
        &#39; ,
      </Flex>
      <Flex ml={['2rem', '2rem', '4rem', '4rem']}>
        <Text mr="5px">location: </Text> &#39;
        <Text color="codeColor">Istanbul/Turkey</Text>
        &#39;,
      </Flex>
      <Flex ml={['2rem', '2rem', '4rem', '4rem']}>
        <Text mr="5px">technologies: </Text> <Text>{'['} </Text>
      </Flex>
      <Flex ml={['4rem', '4rem', '6rem', '6rem']}>
        &#39;<Text color="codeColor">Javascript</Text>&#39;,
      </Flex>
      <Flex ml={['4rem', '4rem', '6rem', '6rem']}>
        &#39;<Text color="codeColor">Typescript</Text>&#39;,
      </Flex>
      <Flex ml={['4rem', '4rem', '6rem', '6rem']}>
        &#39;<Text color="codeColor">React</Text>&#39;{' ]'}
      </Flex>
      <Flex>
        <Text>{'};'}</Text>
        <BlinkContainer />
      </Flex>
    </>
  );
};

export default Codes;
