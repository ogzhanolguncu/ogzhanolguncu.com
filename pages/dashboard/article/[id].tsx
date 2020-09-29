import { GetStaticPaths, GetStaticProps } from 'next';
import React from 'react';
import { Box, Heading, Stack, Tag, Text } from '@chakra-ui/core';
import { DashboardLayout } from '@components/index';
import { Blog } from 'global';
import { blogData } from 'sample-data';

type Props = {
  blog: Blog;
  errors?: string;
};
const BlogDetails = ({ blog, errors }: Props) => {
  if (errors) {
    return (
      <DashboardLayout>
        <p>
          <span style={{ color: 'red' }}>Error:</span> {errors}
        </p>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout>
      <Box w="80%">
        <Heading mb="15px">{blog.title}</Heading>
        <Text mb="15px">{blog.description}</Text>
        <Stack spacing={4} isInline>
          {blog.tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </Stack>
      </Box>
    </DashboardLayout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  // Get the paths we want to pre-render based on users
  const paths = blogData.map((blog) => ({
    params: { id: blog.id.toString() },
  }));
  // { fallback: false } means other routes should 404.
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    const id = params?.id;
    const blog = blogData.find((blog) => blog.id === Number(id));

    return { props: { blog } };
  } catch (err) {
    return { props: { errors: err.message } };
  }
};

export default BlogDetails;
