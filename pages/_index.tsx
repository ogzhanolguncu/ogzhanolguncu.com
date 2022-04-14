import { GetStaticProps } from 'next';
import { Layout, ArticleLists, HeroSection } from '@components/index';
import { getAllFilesFrontMatter } from 'lib/mdx';

import { StaticBlog } from 'global';
import React, { useRef } from 'react';
import { generateRssFeed } from 'scripts/generate-rss';

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
      <HeroSection gotoNewsletter={gotoNewsletter} />
      <ArticleLists blogs={blogPosts} />
      <ArticleLists blogs={popularPosts} isPopular={true} />
    </Layout>
  );
};

export default Home;

export const getStaticProps: GetStaticProps = async () => {
  const blogPosts = await getAllFilesFrontMatter('blog');

  const popularPosts = blogPosts.filter((blog) => blog.isPopular);
  return {
    props: { blogPosts, popularPosts },
  };
};
