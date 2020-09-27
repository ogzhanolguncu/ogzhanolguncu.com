export type IsPopular = {
  popular?: boolean;
};

export type Blog = {
  id: number;
  title: string;
  date: string;
  description: string;
  tags: string[];
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
