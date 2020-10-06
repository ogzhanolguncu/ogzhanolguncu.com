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
};

export type ErrorProps = {
  statusCode: number;
  message: string;
};

export type TagNames =
  | 'javascript'
  | 'css'
  | 'nextjs'
  | 'asynchronous'
  | 'api'
  | 'react'
  | 'tutorial'
  | 'redux';
