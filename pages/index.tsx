import Head from 'next/head';
import { GetStaticProps } from 'next';
import { Layout, Project, Newsletter, ArticleLists, Summary } from '@components/index';
import { getSortedPostsData } from 'lib/posts';

import { StaticBlog } from 'global';
import { useRef } from 'react';

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
      <Head>
        <title>Personal Blog</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
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
  const blogPosts = getSortedPostsData();
  const popularPosts = blogPosts.filter((blog) => blog.isPopular);
  return {
    props: { blogPosts, popularPosts },
  };
};
