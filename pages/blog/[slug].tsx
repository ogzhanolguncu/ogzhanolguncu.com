import { MDXRemote } from 'next-mdx-remote';

import { getFiles, getFileBySlug } from 'lib/mdx';
import BlogLayout from 'layouts';
import { FrontMatterTypes, MdxSource } from 'global';
import MDXComponents from 'componentsV2/MDXComponents';

type Props = {
  frontMatter: FrontMatterTypes;
  mdxSource: MdxSource;
};

export default function Blog({ mdxSource, frontMatter }: Props) {
  return (
    <BlogLayout frontMatter={frontMatter}>
      <MDXRemote
        {...mdxSource}
        components={{
          ...MDXComponents,
        }}
      />
    </BlogLayout>
  );
}

export async function getStaticPaths() {
  const posts = await getFiles('blog');

  return {
    paths: posts.map((p) => ({
      params: {
        slug: p.replace(/\.mdx/, ''),
      },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const post = await getFileBySlug('blog', params.slug);

  return { props: post };
}
