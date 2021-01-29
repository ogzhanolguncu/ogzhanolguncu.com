import { Heading, Text, Box, useColorMode, Flex } from '@chakra-ui/react';
import { Layout, Card } from '@components/index';
import { ColorModeContext } from '@contexts/CustomColorContext';
import { StaticBlog } from 'global';
import { GetStaticProps } from 'next';
import { useContext } from 'react';
import { NextSeo } from 'next-seo';
import { getAllFilesFrontMatter } from 'lib/mdx';

type Props = {
  guides: StaticBlog[];
};

const url = 'https://ogzhanolguncu.com/guides';
const title = 'Guides – Oğuzhan Olguncu';
const description =
  'Guides for all kinds of javascript/typescript tutorials which written from scratch.';

const guides = ({ guides }: Props) => {
  const colorModeObj = useContext(ColorModeContext);
  const { colorMode } = useColorMode();
  return (
    <>
      <NextSeo
        title={title}
        description={description}
        canonical={url}
        openGraph={{
          url,
          title,
          description,
        }}
      />
      <Layout>
        <Flex justifyContent="center" alignItems="center" flexDirection="column" margin="5rem 0">
          <Heading
            textAlign="center"
            as="h2"
            fontSize={['2rem', '2rem', '3rem', '3rem']}
            marginBottom="1rem"
            marginTop={['0.6rem', '0', '0', '0']}
            fontWeight="bold"
            color={colorModeObj.titleColor[colorMode]}
          >
            Guides
          </Heading>
          <Text
            textAlign="center"
            fontSize="1.3rem"
            color={
              colorMode === 'light' ? colorModeObj.titleColor.light : colorModeObj.titleColor.dark
            }
          >
            The missing instruction manuals of the web.
          </Text>
        </Flex>
        {guides.length >= 1 ? (
          <Box
            d="grid"
            gridTemplateColumns={[
              'repeat(1,minmax(0,1fr))',
              'repeat(2,minmax(0,1fr))',
              'repeat(2,minmax(0,1fr))',
              'repeat(3,minmax(0,1fr))',
            ]}
            gridGap="4rem"
            mb={['3rem', '4rem', '5rem', '5rem']}
          >
            {guides.map((blog: StaticBlog) => {
              return (
                <Card
                  key={blog.id}
                  id={blog.id}
                  img={blog.image}
                  title={blog.title}
                  description={blog.summary}
                />
              );
            })}
          </Box>
        ) : (
          <Text textAlign="center" fontSize="1.1rem">
            There will be guides soon.
          </Text>
        )}
      </Layout>
    </>
  );
};

export default guides;

export const getStaticProps: GetStaticProps = async () => {
  const blogPosts = await getAllFilesFrontMatter('blog');
  const guides = blogPosts.filter((blog) => {
    return blog.guides ? blog : null;
  });
  return {
    props: { guides },
  };
};
