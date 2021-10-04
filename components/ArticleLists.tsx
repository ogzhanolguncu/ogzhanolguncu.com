import Link from 'next/link';
import { Box, Text, Flex, Heading, Link as StyledLink, Tag, useColorMode } from '@chakra-ui/react';
import { useContext } from 'react';
import { ColorModeContext } from '@contexts/CustomColorContext';
import { StaticBlog } from 'global';
import LANGUAGE_TAGS from 'styles/languageTags';
import { addTwoMonthToPublishedDate, compareDateWithTodaysDate } from 'utils/dateOperations';
import { Article, ArticleTitle } from '.';
import { useRouter } from 'next/router';

type Props = {
  blogs: StaticBlog[];
  isPopular?: boolean;
};

const ArticleLists = ({ blogs, isPopular = false }: Props) => {
  const colorModeObj = useContext(ColorModeContext);
  const { colorMode } = useColorMode();
  const router = useRouter();

  return (
    <Flex flexDirection="column" m="3rem 0">
      <Flex
        w="100%"
        borderBottom={['none', 'none', '1px solid #d6d9de', '1px solid #d6d9de']}
        alignItems="center"
        paddingBottom=".5rem"
      >
        <Heading
          fontSize={['1.7rem', '1.7rem', '2rem', '2rem']}
          color={colorModeObj.titleColor[colorMode]}
          padding="0.8rem 1rem"
        >
          {isPopular ? 'Popular Articles' : 'Latest Articles'}
        </Heading>
        <Link href="/blog">
          <StyledLink
            ml="3rem"
            mt=".5rem"
            fontWeight="500"
            padding=".3rem .5rem"
            backgroundColor={
              colorMode === 'light' ? colorModeObj.articleTagColor : colorModeObj.buttonColor.dark
            }
            borderRadius="3rem"
            _hover={{
              textDecoration: 'none',
              backgroundColor:
                colorMode === 'light' ? '#868E96' : colorModeObj.buttonHoverColor.dark,
              color: colorMode === 'light' ? colorModeObj.white : colorModeObj.white,
            }}
            fontSize={['.7rem', '.7rem', '.8rem', '.8rem']}
            textAlign="center"
          >
            View All
          </StyledLink>
        </Link>
      </Flex>
      <Flex mt="1.5rem" alignItems="flex-start" justifyContent="center" flexDirection="column">
        {blogs
          .filter((blog) => (isPopular ? blog.isPopular : !blog.isPopular))
          .slice(0, 10)
          .map((blog) => (
            <Article key={blog.id} color={colorMode === 'light' ? 'light' : 'dark'}>
              <ArticleTitle>
                {compareDateWithTodaysDate(addTwoMonthToPublishedDate(blog.publishedAt)) ? (
                  <Tag
                    fontSize={['.8rem', '.8rem', '.8rem', '.7 rem']}
                    p=".5rem"
                    borderRadius=".3rem"
                    m={[
                      '1rem .4rem 1rem 0',
                      '1rem .4rem 1rem 0',
                      '1rem .4rem 1rem 0',
                      '1rem 1rem 10px 0',
                    ]}
                    height="15px"
                    fontWeight="700"
                    width={['2.7rem', '2.7rem', '3.5rem', '3.5rem']}
                    justifyContent="center"
                    minHeight="2rem"
                    color={colorModeObj.articleNewTagTextColor[colorMode]}
                    background={colorModeObj.articleNewTagBackgroundColor[colorMode]}
                  >
                    New!
                  </Tag>
                ) : null}
                <Box>
                  <Text
                    color={colorModeObj.publishedDateColor[colorMode]}
                    fontSize=".8rem"
                    fontWeight="600"
                    marginBottom={['1rem', '1rem', 0, 0]}
                  >
                    {blog.publishedAt}
                  </Text>
                  <Heading
                    fontSize={['1rem', '1.1rem', '1.15rem', '1.15rem']}
                    fontFamily="Inter, Avenir-Roman"
                  >
                    <Link href={`/blog/${blog.id}`}>{blog.title}</Link>
                  </Heading>
                </Box>
              </ArticleTitle>
              <Box
                d="flex"
                flexDirection={['row', 'row', 'row', 'row']}
                justifyContent={['flex-start', 'flex-start', 'flex-end', 'flex-end']}
                alignItems={['flex-start', 'center', 'center', 'center']}
                w="100%"
                flexWrap="wrap"
              >
                {blog?.languageTags?.map((tag, index) => {
                  const color = LANGUAGE_TAGS[tag];
                  return (
                    <Tag
                      key={index}
                      width="max-content"
                      height="20px"
                      p=".3rem .5rem"
                      minHeight="2rem"
                      fontSize=".8rem"
                      borderRadius="16px"
                      marginBottom="7px"
                      marginRight=".5rem"
                      color="#fff"
                      backgroundColor={color?.color}
                      _hover={{ cursor: 'pointer', backgroundColor: color?.hover }}
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
              </Box>
            </Article>
          ))}
      </Flex>
    </Flex>
  );
};

export default ArticleLists;
