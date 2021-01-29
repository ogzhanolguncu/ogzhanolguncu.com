import { GetStaticProps } from 'next';
import { Layout, Project, Newsletter, ArticleLists, Summary } from '@components/index';
import { getAllFilesFrontMatter } from 'lib/mdx';

import { StaticBlog } from 'global';
import React, { useRef } from 'react';

type Props = {
  blogPosts: StaticBlog[];
  popularPosts: StaticBlog[];
};

const Home = ({ blogPosts, popularPosts }: Props) => {
  const newsletterRef = useRef<HTMLInputElement>(null);
  const gotoNewsletter = () => {
    window.scrollTo({
      top: newsletterRef.current?.offsetTop,
      behavior: 'smooth',
    });
  };
  return (
    <Layout>
      <Summary gotoNewsletter={gotoNewsletter} />
      <ArticleLists blogs={blogPosts} />
      <ArticleLists blogs={popularPosts} isPopular={true} />
      <Project />
      <Newsletter ref={newsletterRef} />
    </Layout>
  );
};

export default Home;

export const getStaticProps: GetStaticProps = async () => {
  const blogPosts = (await getAllFilesFrontMatter('blog')).map((blog) => {
    blog.languageTags?.sort(() => 0.5 - Math.random());
    return blog;
  });
  const popularPosts = blogPosts.filter((blog) => blog.isPopular);
  return {
    props: { blogPosts, popularPosts },
  };
};
