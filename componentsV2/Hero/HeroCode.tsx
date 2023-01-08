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
      justifyContent={["flex-start", "flex-start", "flex-start", "flex-end"]}
      alignItems={["flex-start", "flex-start", "flex-start", "flex-end"]}
    >
      <Box position="relative">
        <Box
          w={["300px", "400px", "400px", "500px"]}
          height="450px"
          borderRadius="9px"
          background="black"
          boxShadow="8px 6px #8080805e"
          padding="2rem"
          color="#fff"
          fontSize={["1.2rem", "1.5rem", "1.5rem", "1.5rem"]}
        >
          <CodeContainer>
            <TypeIt
              options={{
                cursor: false,
                speed: 35,
                lifeLike: true,
                loop: true,
                loopDelay: 5000,
                startDelete: true,
                startDelay: 1000,
                deleteSpeed: 35,
                waitUntilVisible: true,
              }}
            >
              <Codes />
            </TypeIt>
          </CodeContainer>
        </Box>
        <Box
          position="absolute"
          left={["20px", "150px", "150px", "-70px"]}
          bottom={["-60px", "-60px", "-65px", "-70px"]}
          padding={["15px 20px", "15px 20px", "20px 30px", "20px 30px"]}
          w={["300px", "300px", "340px", "340px"]}
          borderRadius="10px"
          background="rgba(255, 255, 255, 0.27)"
          boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)"
          backdropFilter="blur(10.3px)"
        >
          <Flex>
            <Image
              src={"/static/images/colored.webp"}
              alt="Profile Photo of Oğuzhan Olguncu"
              loading="eager"
              placeholder="blur"
              blurDataURL={`data:image/svg+xml;base64,${toBase64(
                shimmer(700, 475)
              )}`}
              width={90}
              height={90}
              style={{
                maxWidth: "100%",
                height: "auto",
                borderRadius: "50%",
              }}
              priority
            />
            <Flex
              ml="28px"
              flexDirection="column"
              justifyContent="center"
              alignItems="flex-start"
              fontWeight="medium"
            >
              <Text fontWeight="normal" color="#d4cecd">
                Oğuzhan Olguncu
              </Text>
              <Text color="#1f2334">Engineer, mentor blogger.</Text>
            </Flex>
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
};

export default HeroSectionCode;

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);