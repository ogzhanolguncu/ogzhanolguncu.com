export type Blog = {
  id: number;
  title: string;
  date: string;
  description: string;
  tags: string[];
};

export type StaticBlog = {
  id: string;
  title: string;
  publishedAt: Date;
  summary: string;
  image: string;
  languageTags: string[];
  isPopular: boolean;
  guides: boolean;
  readingTime: string;
  year: number;
};

export type ErrorProps = {
  statusCode: number;
  message: string;
};

export type TimeLineProps = {
  text: string;
  date: string;
  category: {
    tag: string;
    color: { light: string; dark: string };
  };
};

type MatterTypes = {
  wordCount: number;
  slug: string;
  summary: string;
  readingTime: {
    text: string;
    minutes: number;
    time: number;
    words: number;
  };
};

export type MdxSource = {
  compiledSource: string;
  renderedOutput: string;
};

export type FrontMatterTypes = StaticBlog & MatterTypes;
