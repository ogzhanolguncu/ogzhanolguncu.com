import {
  Heading,
  Text,
  Link as StyledLink,
  Flex,
  List,
  ListItem,
  useColorMode,
} from '@chakra-ui/core';
import styled from '@emotion/styled';

import { Layout } from '@components/index';
import TextLink from '@components/TextLink';
import { useContext } from 'react';
import { ColorModeContext } from '@contexts/CustomColorContext';

const Blockquote = styled.blockquote`
  margin: 2.5rem 0;
  border: none;
  border-left: 12px solid #d6d9de;
`;

const About = () => {
  const colorModeObj = useContext(ColorModeContext);
  const { colorMode } = useColorMode();

  return (
    <Layout>
      <Flex
        flexDirection="column"
        justifyContent="center"
        alignItems="flex-start"
        w="840px"
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
          margin="1.5rem auto"
        >
          About me
        </Heading>
        <Text
          fontSize="1.05rem"
          mb="1.5rem"
          fontWeight="400"
          color={
            colorMode === 'light'
              ? colorModeObj.aboutTextColor.light
              : colorModeObj.aboutTextColor.dark
          }
        >
          Hi! I'm Tania Rascia. I currently work full-time as a Senior Software Engineer, and I
          build {''}
          <TextLink text="open-source projects" />
          for fun. I went through a successful career change in 2014. This is my personal website
          where I share everything I know
        </Text>
        <Text
          fontSize="1.05rem"
          mb="1.5rem"
          fontWeight="400"
          color={
            colorMode === 'light'
              ? colorModeObj.aboutTextColor.light
              : colorModeObj.aboutTextColor.dark
          }
        >
          I taught myself how to make websites first as a hobby and later as a professional
          programmer. I've been documenting everything I learn since I began, and the site grown to
          the point that it helps millions of people every year. I've been featured in{' '}
          <TextLink text="the official React docs" />, won 3rd in {''}
          <TextLink text="Personal Dev Blog of the Year" />, and written dozens of articles for
          other publications.
        </Text>
        <Text
          fontSize="1.05rem"
          mb="1.5rem"
          fontWeight="400"
          color={
            colorMode === 'light'
              ? colorModeObj.aboutTextColor.light
              : colorModeObj.aboutTextColor.dark
          }
        >
          I believe in keeping a site with no ads, affiliates, sponsors, tracking, analytics, and
          social media. It's just you and me.
        </Text>
        <Text
          fontSize="1.05rem"
          mb="1.5rem"
          fontWeight="400"
          color={
            colorMode === 'light'
              ? colorModeObj.aboutTextColor.light
              : colorModeObj.aboutTextColor.dark
          }
        >
          I also like to make open source projects, all of which can be found on{' '}
          <TextLink text="Github" />. A few I'm proud of are:
        </Text>
        <List
          styleType="disc"
          fontSize="1.05rem"
          mb="1.5rem"
          p={['0 0', '0 0', '0 2rem', '0 2rem']}
          color={
            colorMode === 'light'
              ? colorModeObj.aboutTextColor.light
              : colorModeObj.aboutTextColor.dark
          }
        >
          <ListItem>
            A <TextLink text="Chip-8 emulator" /> in JavaScript, which I {''}
            <TextLink text="wrote about here" />
          </ListItem>
          <ListItem>
            Laconia, an app I built to learn how to write secure authentication from scratch using
            model-view-controller architecture (Source)
          </ListItem>
          <ListItem>
            <TextLink text="Take note" />, an in-progress notes app for the web (Source)
          </ListItem>
          <ListItem>
            <TextLink text="Primitive" />, a simple CSS framework built on Sass (Source)
          </ListItem>
          <ListItem>
            <TextLink text="New Moon" />, the world's greatest web development code theme (for VS
            Code) (Source)
          </ListItem>
        </List>
        <Text
          fontSize="1.05rem"
          mb="1.5rem"
          fontWeight="400"
          color={
            colorMode === 'light'
              ? colorModeObj.aboutTextColor.light
              : colorModeObj.aboutTextColor.dark
          }
        >
          I also like hiking and biking, I've done a lot of solo travel (around Europe and America)
          and I can speak Spanish. My favorite instrument is the accordion.
        </Text>
        <Heading
          fontSize="1.6rem"
          color={
            colorMode === 'light' ? colorModeObj.titleColor.light : colorModeObj.titleColor.dark
          }
          mb="1rem"
        >
          Get in touch
        </Heading>
        <Text
          fontSize="1.05rem"
          mb="1.5rem"
          fontWeight="400"
          color={
            colorMode === 'light'
              ? colorModeObj.aboutTextColor.light
              : colorModeObj.aboutTextColor.dark
          }
        >
          I hope you love the site, and if there's anything you want to talk about with me feel free
          to drop me a line by email. I'm happy to hear your comments, feedback, suggestions, or
          just say hi!{' '}
          <em>(Emails regarding ads, sponsored posts, link-sharing, etc. will be ignored.)</em>
        </Text>
        <Text mb="2rem">
          <StyledLink
            _hover={{ textDecoration: 'none', borderBottomColor: '#BAC8FF' }}
            href="#"
            borderBottom={colorMode === 'light' ? '7px solid #dbe4ff' : null}
            color={colorMode === 'light' ? '#000' : '#6ab0f3'}
            fontSize={['1.2rem', '1.6rem', '1.8rem', '1.8rem']}
            fontWeight="bold"
            wordBreak="break-word"
          >
            oguzhan_olguncu@gmail.com
          </StyledLink>
        </Text>
        <List
          styleType="disc"
          fontSize="1.05rem"
          mb="3rem"
          p={['0 0', '0 0', '0 2rem', '0 2rem']}
          color={
            colorMode === 'light'
              ? colorModeObj.aboutTextColor.light
              : colorModeObj.aboutTextColor.dark
          }
        >
          <ListItem>
            🐦 &nbsp; <strong>Twitter:</strong> {''}
            <TextLink text="@oguzhanolguncu" />
          </ListItem>
          <ListItem>
            🐙 &nbsp; <strong>Github:</strong> {''}
            <TextLink text="@oguzhanolguncu" />
          </ListItem>
        </List>
        <Heading
          fontSize="1.6rem"
          color={
            colorMode === 'light' ? colorModeObj.titleColor.light : colorModeObj.titleColor.dark
          }
          mb="1.5rem"
          pb="1rem"
          borderBottom="1px solid #d6d9de"
          w="100%"
        >
          Timeline
        </Heading>
        <List
          styleType="disc"
          fontSize="1.05rem"
          mb="3rem"
          p={['0 0', '0 0', '0 2rem', '0 2rem']}
          color={
            colorMode === 'light'
              ? colorModeObj.aboutTextColor.light
              : colorModeObj.aboutTextColor.dark
          }
        >
          <ListItem>
            <strong>1989:</strong> Born in Chicago, the youngest of four and the only girl.
          </ListItem>
          <ListItem>
            <strong>1994 – 1997:</strong> Family gets our first computer, a PC running DOS then
            Windows 3.11, then back to DOS for a while after my brother deleted Win.exe. I use the
            computer a lot, mostly drawing things on MS Paint and playing WarCraft.
          </ListItem>
          <ListItem>
            <strong>1998 – 2005:</strong> My brother takes me to the library, and I discover the
            internet. On the first day, I make an email address and learn the meaning of "lol". I
            draw things at home, save them to floppy disks, and upload them online. I join and
            create tons of forum throughout the years. I make websites for the guilds I'm part of,
            made-up Digimon, my art, myself, video games, and anything else I'm into.
          </ListItem>
          <ListItem>
            <strong>2005:</strong> I make a website about Seona Dancing, Ricky Gervais's failed
            eighties duo musical endeavor. (This seems to be one of the few sites the Internet
            Archive has retained.)
          </ListItem>
          <ListItem>
            <strong>2007:</strong> I graduate high school. With no specific plans, ideas, or
            aspirations of what I should do with the rest of my life, I go to college for Culinary
            Arts.
          </ListItem>
          <ListItem>
            <strong>2017:</strong> After two years, I quit to solo travel around Europe for a couple
            months, visiting 15 countries while writing for DigitalOcean.
          </ListItem>
          <ListItem>
            <strong>2019 – Present:</strong> Working as a Senior Software Engineer for a large
            corporation.
          </ListItem>
        </List>
        <Heading
          fontSize="1.6rem"
          color={
            colorMode === 'light' ? colorModeObj.titleColor.light : colorModeObj.titleColor.dark
          }
          mb="1.5rem"
          pb="1rem"
          borderBottom="1px solid #d6d9de"
          w="100%"
        >
          Some quotes
        </Heading>
        <Blockquote>
          <Text ml="20px" fontSize="1.5rem">
            Tania writes extremely clear, concise tutorials. It's no exaggeration to say that I
            wouldn't currently have a job in development without this site. So thanks for ruining my
            life, Tania
          </Text>
          <i style={{ color: 'darkslateblue', fontSize: '2rem', float: 'right' }}>
            Micheal Scofield
          </i>
        </Blockquote>
      </Flex>
    </Layout>
  );
};

export default About;
