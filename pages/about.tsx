import { Heading, Text, Flex, Box } from '@chakra-ui/react';

import React, { ReactNode } from 'react';
import { NextSeo } from 'next-seo';
import Layout from 'componentsV2/Layout';

const url = 'https://ogzhanolguncu.com/about';
const title = 'About Me – Oğuzhan Olguncu';

const CustomText = ({ children }: { children: ReactNode }) => {
  return (
    <Box
      fontSize="18px"
      lineHeight="1.7"
      css={{
        wordSpacing: '1.2px',
        letterSpacing: '0.1px',
      }}
      fontWeight={500}
    >
      {children}
    </Box>
  );
};
const About = () => {
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
        <Flex justifyContent="center" alignItems="center" margin="5rem 0" flexDirection="column">
          <Heading textAlign="center" fontSize={['2rem', '2rem', '3rem', '3rem']}>
            About me
          </Heading>
          <Flex
            padding={['1rem', '2rem', '2rem', '2rem']}
            marginTop="1.3rem"
            d="flex"
            flexDirection="row"
            justifyContent="flex-start"
            alignItems="flex-start"
            w={['100%', '90%', '75%', '75%']}
            flexWrap="wrap"
            gap="1rem"
          >
            <CustomText>
              Hi! I'm Oğuzhan Olguncu. I currently work full-time as a Frontend Developer, and I
              build
              <Text as="span" backgroundColor="#000" color="#fff" p="0.2rem" mx="0.3rem">
                open-source projects
              </Text>
              for fun. I taught myself how to make websites first as a hobby and later as a
              professional programmer. I've been documenting everything I've learned since I began.
              I also love to make open source projects, all of which can be found on Github and I'm
              also huge classical Turkish music lover and recreational powerlifter.
              <Heading fontSize="1.3rem" mt="3rem" mb="1rem">
                Get in touch
              </Heading>
              I hope you love the site, and if there's anything you want to talk about with me feel
              free to drop me a line by email. I'm happy to hear your comments, feedback,
              suggestions, or just say hi!
              <em>(Emails regarding ads, sponsored posts, link-sharing, etc. will be ignored.)</em>
            </CustomText>
            <Flex gap="2rem" mt="1rem">
              <Box>
                📧 &nbsp; <strong>Github:</strong> {''}
                <Text
                  as="a"
                  href="https://github.com/ogzhanolguncu"
                  backgroundColor="#000"
                  color="#fff"
                  p="0.2rem"
                >
                  @ogzhanolguncu
                </Text>
              </Box>
              <Box>
                🐙 &nbsp; <strong>Email:</strong> {''}
                <Text
                  as="a"
                  href="mailto:ogzhan11@gmail.com"
                  backgroundColor="#000"
                  color="#fff"
                  p="0.2rem"
                >
                  @ogzhanolguncu
                </Text>
              </Box>
            </Flex>
          </Flex>
        </Flex>
        <Box mt={['3rem', '3rem', '6rem', '6rem']} />
      </Layout>
    </>
  );
};

export default About;
