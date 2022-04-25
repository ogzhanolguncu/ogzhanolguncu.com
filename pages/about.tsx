import { Heading, Text, Flex, List, ListItem, Box } from '@chakra-ui/react';

import React, { ReactNode } from 'react';
import { NextSeo } from 'next-seo';
import Layout from 'componentsV2/Layout';

const url = 'https://ogzhanolguncu.com/about';
const title = 'About Me – Oğuzhan Olguncu';

const CustomText = ({ children }: { children: ReactNode }) => {
  return (
    <Text fontSize="1.05rem" mb="1.5rem" fontWeight="400">
      {children}
    </Text>
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
        <Flex flexDirection="column" justifyContent="center" alignItems="flex-start">
          <Heading
            textAlign="center"
            fontSize={['2rem', '2rem', '3rem', '3rem']}
            margin="5rem auto"
          >
            About me
          </Heading>
          <CustomText>
            Hi! I'm Oğuzhan Olguncu. I currently work full-time as a Frontend Developer, and I build
            <Text as="span" backgroundColor="#000" color="#fff" p="0.2rem" mx="0.3rem">
              open-source projects
            </Text>
            for fun.
          </CustomText>
          <CustomText>
            I taught myself how to make websites first as a hobby and later as a professional
            programmer. I've been documenting everything I've learned since I began.
          </CustomText>
          <CustomText>
            I also love to make open source projects, all of which can be found on Github and I'm
            also huge classical Turkish music lover and recreational powerlifter.
          </CustomText>
          <Heading fontSize="1.3rem" mb="1rem">
            Get in touch
          </Heading>
          <CustomText>
            I hope you love the site, and if there's anything you want to talk about with me feel
            free to drop me a line by email. I'm happy to hear your comments, feedback, suggestions,
            or just say hi!
            <em>(Emails regarding ads, sponsored posts, link-sharing, etc. will be ignored.)</em>
          </CustomText>
          <List fontSize="1.05rem" mb="3rem">
            <ListItem>
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
            </ListItem>
            <ListItem>
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
            </ListItem>
          </List>
        </Flex>
        <Box mt={['3rem', '3rem', '6rem', '6rem']} />
      </Layout>
    </>
  );
};

export default About;
