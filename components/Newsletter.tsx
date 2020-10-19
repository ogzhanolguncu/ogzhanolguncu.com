import { Box, Heading, Text, useColorMode, Link as StyledLink } from '@chakra-ui/core';
import { ColorModeContext } from '@contexts/CustomColorContext';
import React, { useContext } from 'react';

const Newsletter = React.forwardRef((props, ref: React.Ref<HTMLDivElement>) => {
  const colorModeObj = useContext(ColorModeContext);
  const { colorMode } = useColorMode();
  return (
    <Box my={4} w="100%" ref={ref} {...props}>
      <Heading
        fontSize={['1.7rem', '1.7rem', '2rem', '2rem']}
        color={colorModeObj.titleColor[colorMode]}
        mb={4}
        borderBottom={['none', 'none', '1px solid #d6d9de', '1px solid #d6d9de']}
        paddingBottom=".5rem"
      >
        Subscribe to the newsletter
      </Heading>
      <Text color="#787f87" fontSize="1.1rem" fontWeight="400">
        Get emails from me about web development, tech, and early access to new articles.
      </Text>
      <StyledLink
        href="https://ogzhanolguncu.substack.com/p/coming-soon?r=argne&utm_campaign=post&utm_medium=email&utm_source=copy"
        isExternal
        backgroundColor={colorModeObj.buttonColor[colorMode]}
        d="inline-block"
        color="white"
        padding="20px 25px"
        _hover={{
          backgroundColor:
            colorMode === 'light'
              ? colorModeObj.buttonHoverColor.light
              : colorModeObj.buttonHoverColor.dark,
        }}
        fontWeight="600"
        fontSize={['15px', '16px', '16px', '18px']}
        mt="15px"
        mb={['10px', '10px', '0px', '0px']}
        mr={['0px', '0', '10px', '10px']}
        borderRadius=".25rem"
      >
        <Text d="inline-block" mr="8px">
          &#9889;
        </Text>
        Join the Newsletter
      </StyledLink>
    </Box>
  );
});

export default Newsletter;
