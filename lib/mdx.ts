import fs from "fs";
import matter from "gray-matter";
// @ts-ignore
import path from "path";
import readingTime from "reading-time";
import { serialize } from "next-mdx-remote/serialize";
import { StaticBlog } from "global";
import dayjs from "dayjs";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeCodeTitles from "rehype-code-titles";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";

const root = process.cwd();

export async function getFiles(type: string) {
  return fs.readdirSync(path.join(root, "data", type));
}

export async function getFileBySlug(type: string, slug: string) {
  const source = slug
    ? fs.readFileSync(path.join(root, "data", type, `${slug}.mdx`), "utf8")
    : fs.readFileSync(path.join(root, "data", `${type}.mdx`), "utf8");

  const { data, content } = matter(source);

  const mdxSource = await serialize(source, {
    parseFrontmatter: true,
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        rehypeCodeTitles,
        rehypePrism,
        [
          rehypeAutolinkHeadings,
          {
            properties: {
              className: ["anchor"],
            },
          },
        ],
      ],
      format: "mdx",
    },
  });

  return {
    mdxSource,
    frontMatter: {
      readingTime: readingTime(content),
      slug,
      ...data,
    },
  };
}

export async function getAllFilesFrontMatter(type: string) {
  const files = fs.readdirSync(path.join(root, "data", type));

  const allPostsData: StaticBlog[] = files.reduce(
    (allPosts: any, postSlug: string) => {
      const source = fs.readFileSync(
        path.join(root, "data", type, postSlug),
        "utf8"
      );
      const { data, content } = matter(source);
      return [
        {
          ...data,
          id: postSlug.replace(/\.mdx$/, ""),
          readingTime: readingTime(content).text.split("read")[0],
          year: dayjs(data.publishedAt).year(),
        },
        ...allPosts,
      ];
    },
    []
  );

  return allPostsData.sort((a, b) => {
    if (a.publishedAt < b.publishedAt) {
      return 1;
    } else {
      return -1;
    }
  });
}
