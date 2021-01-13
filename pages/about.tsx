import { Heading, Text, Flex, List, ListItem, useColorMode } from '@chakra-ui/react';

import { Layout } from '@components/index';
import TextLink from '@components/TextLink';
import React, { ReactNode, useContext } from 'react';
import { ColorModeContext } from '@contexts/CustomColorContext';
import { NextSeo } from 'next-seo';
import Timeline from '@components/Timeline';

const url = 'https://ogzhanolguncu.com/about';
const title = 'About Me – Oğuzhan Olguncu';

const CustomText = ({ children }: { children: ReactNode }) => {
  const colorModeObj = useContext(ColorModeContext);
  const { colorMode } = useColorMode();

  return (
    <Text
      fontSize="1.05rem"
      mb="1.5rem"
      fontWeight="400"
      color={
        colorMode === 'light' ? colorModeObj.aboutTextColor.light : colorModeObj.aboutTextColor.dark
      }
    >
      {children}
    </Text>
  );
};
const About = () => {
  const colorModeObj = useContext(ColorModeContext);
  const { colorMode } = useColorMode();

  return (
    <>
      <NextSeo
        title={title}
        canonical={url}
        openGraph={{
          url,
          title,
        }}
      />
      <Layout>
        <Flex
          flexDirection="column"
          justifyContent="center"
          alignItems="flex-start"
          maxW="100%"
          mx="auto"
          p="0 2rem"
        >
          <Heading
            textAlign="center"
            fontSize={['2rem', '2rem', '3rem', '3rem']}
            color={
              colorMode === 'light' ? colorModeObj.titleColor.light : colorModeObj.titleColor.dark
            }
            margin="5rem auto"
          >
            About me
          </Heading>
          <CustomText>
            Hi! I'm Oğuzhan Olguncu. I currently work full-time as a Frontend Developer, and I build
            {''}
            <TextLink text=" open-source projects " url="#" /> for fun.
          </CustomText>
          <CustomText>
            I taught myself how to make websites first as a hobby and later as a professional
            programmer. I've been documenting everything I learn since I began.
          </CustomText>
          <CustomText>
            I also like to make open source projects, all of which can be found on github and I'm
            also huge classical turkish music lover and recreational powerlifter.
          </CustomText>

          <Heading
            fontSize="1.3rem"
            color={
              colorMode === 'light' ? colorModeObj.titleColor.light : colorModeObj.titleColor.dark
            }
            mb="1rem"
            fontFamily="Inter"
          >
            Get in touch
          </Heading>
          <CustomText>
            I hope you love the site, and if there's anything you want to talk about with me feel
            free to drop me a line by email. I'm happy to hear your comments, feedback, suggestions,
            or just say hi!{' '}
            <em>(Emails regarding ads, sponsored posts, link-sharing, etc. will be ignored.)</em>
          </CustomText>
          <List
            fontSize="1.05rem"
            mb="3rem"
            color={
              colorMode === 'light'
                ? colorModeObj.aboutTextColor.light
                : colorModeObj.aboutTextColor.dark
            }
          >
            <ListItem>
              📧 &nbsp; <strong>Github:</strong> {''}
              <TextLink text="@ogzhanolguncu" url="https://github.com/ogzhanolguncu" />
            </ListItem>
            <ListItem>
              🐙 &nbsp; <strong>Email:</strong> {''}
              <TextLink text="@ogzhanolguncu" url="mailto:ogzhan11@gmail.com" />
            </ListItem>
          </List>
          <Heading
            fontSize="1.6rem"
            textAlign="center"
            fontFamily="Inter"
            color={
              colorMode === 'light' ? colorModeObj.titleColor.light : colorModeObj.titleColor.dark
            }
            mb="1.5rem"
            pb="1rem"
            w="100%"
          >
            Timeline
          </Heading>
          <Timeline />
        </Flex>
      </Layout>
    </>
  );
};

export default About;
