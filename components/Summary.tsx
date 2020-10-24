import Link from 'next/link';

import {
  Flex,
  Box,
  Heading,
  Text,
  Image,
  Link as StyledLink,
  Button,
  useColorMode,
} from '@chakra-ui/core';

import React from 'react';
import { useContext } from 'react';
import { ColorModeContext } from 'contexts/CustomColorContext';

type Props = {
  gotoNewsletter: () => void;
};

const Summary = ({ gotoNewsletter }: Props) => {
  const { colorMode } = useColorMode();
  const colorModeObj = useContext(ColorModeContext);

  return (
    <Flex
      margin={['1.5rem 0', '1.5rem 0', '1.5rem 0', '4.5rem 0']}
      flexDirection={['column-reverse', 'column-reverse', 'row']}
      justifyContent="space-between"
    >
      <Box maxW="600px">
        <Heading
          as="h1"
          fontSize={['1.6rem', '2rem', '2.3rem', '2.6rem']}
          lineHeight="1.4"
          marginBottom="2rem"
          marginTop={['0.6rem', '0', '0', '0']}
          fontWeight="bold"
          color={colorModeObj.titleColor[colorMode]}
        >
          Hey! I'm Oğuzhan Olguncu. I'm a software developer and open-source lover.
        </Heading>
        <Text
          fontSize={['1rem', '1rem', '1.2rem', '1.3rem']}
          marginBottom="2.5rem"
          fontWeight="400"
          color={colorModeObj.feedBackButtonColor.dark}
        >
          This website is my 📚 digital library of the things I have learned and created over the
          years, and anything else I want to write about. You can read my{' '}
          <Link href="/blog">
            <StyledLink
              color={colorModeObj.linkColor[colorMode]}
              href="/blog"
              fontWeight="700"
              _hover={{
                textDecoration: 'none',
                borderBottom: '0.3rem solid #dbe4ffde',
                borderBottomColor:
                  colorMode === 'light'
                    ? colorModeObj.linkHoverColor.light
                    : colorModeObj.linkHoverColor.dark,
                color:
                  colorMode === 'light'
                    ? colorModeObj.linkHoverColor.light
                    : colorModeObj.linkHoverColor.dark,
              }}
            >
              blog
            </StyledLink>
          </Link>
          , view my
          <Link href="/guides">
            <StyledLink
              color={colorModeObj.linkColor[colorMode]}
              href="/guides"
              fontWeight="700"
              ml={2}
              _hover={{
                textDecoration: 'none',
                borderBottom: '0.3rem solid #dbe4ffde',
                borderBottomColor:
                  colorMode === 'light'
                    ? colorModeObj.linkHoverColor.light
                    : colorModeObj.linkHoverColor.dark,
                color:
                  colorMode === 'light'
                    ? colorModeObj.linkHoverColor.light
                    : colorModeObj.linkHoverColor.dark,
              }}
            >
              guides & blog
            </StyledLink>
          </Link>
          , or learn more
          <Link href="/about">
            <StyledLink
              color={colorModeObj.linkColor[colorMode]}
              href="/about"
              fontWeight="700"
              ml={2}
              _hover={{
                textDecoration: 'none',
                borderBottom: '0.3rem solid',
                borderBottomColor:
                  colorMode === 'light'
                    ? colorModeObj.linkHoverColor.light
                    : colorModeObj.linkHoverColor.dark,
                color:
                  colorMode === 'light'
                    ? colorModeObj.linkHoverColor.light
                    : colorModeObj.linkHoverColor.dark,
              }}
            >
              about me
            </StyledLink>
          </Link>
          .
        </Text>
        <Box flexDirection={['column', 'column', 'row', 'row']} d="flex">
          <Button
            onClick={gotoNewsletter}
            backgroundColor={colorModeObj.buttonColor[colorMode]}
            color="white"
            padding="30px 30px"
            _hover={{
              backgroundColor:
                colorMode === 'light'
                  ? colorModeObj.buttonHoverColor.light
                  : colorModeObj.buttonHoverColor.dark,
            }}
            fontWeight="600"
            fontSize={['15px', '16px', '16px', '18px']}
            mb={['10px', '10px', '0px', '0px']}
            mr={['0px', '0', '10px', '10px']}
          >
            <Text mr="8px">&#9889;</Text>
            Join Newsletter
          </Button>
          <Button
            background={colorModeObj.feedBackButtonBackgroundColor[colorMode]}
            color={colorModeObj.feedBackButtonColor[colorMode]}
            padding="30px 30px"
            fontWeight="600"
            fontSize={['15px', '16px', '16px', '18px']}
            _hover={{
              backgroundColor:
                colorMode === 'light' ? colorModeObj.buttonHoverColor.light : 'orange.500',
              color: 'white',
            }}
          >
            <Text mr="8px">&#128239;</Text> Give Feedback
          </Button>
        </Box>
      </Box>
      <Box size={['350', '150']} margin={['auto 0', '10px 0', '0 0', '0 0']}>
        <Image
          h={['150px', '150px', '350px']}
          src={'/static/images/350.jpg'}
          alt="Owl"
          borderRadius="16px"
          w={['150px', '150px', '350px']}
          ignoreFallback
        />
      </Box>
    </Flex>
  );
};

export default Summary;
