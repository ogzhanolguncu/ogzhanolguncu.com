import Head from 'next/head';
import Layout from '@components/Layout';
import { Flex, Box, Heading, Text, Image, Link as StyledLink, Link } from '@chakra-ui/core';
import personalImage from '../public/350.jpg';

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Personal Blog</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex margin="4.5rem 0" flexDirection="row" justifyContent="space-between">
        <Box maxW="600px">
          <Heading
            as="h1"
            fontSize="2.6rem"
            lineHeight="1.1"
            marginBottom="2rem"
            fontWeight="bold"
            color="#343a40"
          >
            Hey! I'm Tania Rascia. I'm a software engineer and open-source creator.
          </Heading>
          <Text fontSize="1.3rem" marginBottom="2.5rem" fontWeight="400" color="#787f87">
            This website is my 🌱 digital garden—a compendium of the things I have learned and
            created over the years, and anything else I want to write about. You can read my{' '}
            <Link>
              <StyledLink
                color="blue.500"
                href="#"
                fontWeight="700"
                _hover={{
                  textDecoration: '#dbe4ffde',
                  color: '#1b1d25',
                }}
              >
                blog
              </StyledLink>
            </Link>
            , view my
            <Link>
              <StyledLink
                color="blue.500"
                href="#"
                fontWeight="700"
                ml={2}
                _hover={{
                  textDecoration: '#dbe4ffde',
                  color: '#1b1d25',
                }}
              >
                guides & blog
              </StyledLink>
            </Link>
            , or learn more
            <Link>
              <StyledLink
                color="blue.500"
                href="#"
                fontWeight="700"
                ml={2}
                _hover={{
                  textDecoration: '#dbe4ffde',
                  color: '#1b1d25',
                }}
              >
                about me
              </StyledLink>
            </Link>
            .
          </Text>
        </Box>
        <Box size={350} d="flex" alignItems="center" paddingTop="3.5rem">
          <Image src={personalImage} alt="Owl" borderRadius="16px" />
        </Box>
      </Flex>
    </Layout>
  );
}

// TODO Buttonlar eklenecek
// TODO Bu sayfa component yapılacak
// TODO Footer yapılacak
