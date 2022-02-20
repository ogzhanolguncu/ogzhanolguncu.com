import { useRouter } from 'next/router';
import React, { useContext } from 'react';
import { Flex, Heading, Stack, Tag, Text, useColorMode, Link } from '@chakra-ui/react';
import LANGUAGE_TAGS from 'styles/languageTags';
import { RiEdit2Line } from 'react-icons/ri';
import dayjs from 'dayjs';

import { ColorModeContext } from '@contexts/CustomColorContext';
import { Layout } from '@components/index';
import BlogSeo from '@components/BlogSeo';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function BlogLayout({ children, frontMatter }: any) {
  const router = useRouter();
  const slug = frontMatter.slug;
  const { colorMode } = useColorMode();
  const colorModeObj = useContext(ColorModeContext);
  const textColor = {
    light: 'gray.700',
    dark: 'gray.400',
  };

  return (
    <Layout>
      <BlogSeo url={`https://ogzhanolguncu.com/blog/${slug}`} {...frontMatter} />
      <Stack
        spacing={8}
        justifyContent="center"
        alignItems="flex-start"
        m="0 auto 4rem auto"
        maxWidth="800px"
        w="100%"
      >
        <Flex
          margin="5rem 0"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          maxWidth="800px"
          w="100%"
          textAlign="center"
        >
          <Heading
            letterSpacing="tight"
            mb={2}
            size="2xl"
            color={colorModeObj.titleColor[colorMode]}
            lineHeight="1.4"
          >
            {frontMatter.title}
          </Heading>
          <Flex
            justifyContent="space-between"
            align={['initial', 'center']}
            direction={['column', 'row']}
            mt={2}
            w="100%"
            mb={4}
          >
            <Flex justifyContent="center" width="100%" my="1rem">
              <Text fontSize="md" color={textColor[colorMode]}>
                {frontMatter.by}
                {`Oğuzhan Olguncu\u00a0\u00a0\u00a0/\u00a0\u00a0\u00a0`}
                {dayjs(frontMatter.publishedAt).format('MMMM D, YYYY')}
                {`\u00a0\u00a0\u00a0/\u00a0\u00a0\u00a0 ${frontMatter.readingTime.text} `}
              </Text>
            </Flex>
          </Flex>
          <Flex justifyContent="center" w="100%">
            {frontMatter.languageTags?.map((tag: string, index: number) => {
              const color = LANGUAGE_TAGS[tag];
              return (
                <Tag
                  size={'md'}
                  key={index}
                  color="#fff"
                  backgroundColor={color?.color}
                  _hover={{ cursor: 'pointer', backgroundColor: color.hover }}
                  mr="5px"
                  onClick={() =>
                    router.push({
                      pathname: '/blog/',
                      query: { tag },
                    })
                  }
                >
                  {tag}
                </Tag>
              );
            })}
          </Flex>
        </Flex>
        {children}
        <Link
          display="flex"
          flexDirection="row"
          alignItems="center"
          isExternal
          href={`https://github.com/ogzhanolguncu/ogzhanolguncu.com/blob/master/data/blog/${slug}.mdx`}
        >
          <RiEdit2Line size={25} />
          <Text marginLeft=".5rem" marginTop="5px">
            Edit this page
          </Text>
        </Link>
      </Stack>
    </Layout>
  );
}
