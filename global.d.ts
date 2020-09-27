type IsPopular = {
  popular?: boolean;
};

type Blog = {
  id: number;
  title: string;
  date: string;
  description: string;
  tags: string[];
};

type ErrorProps = {
  statusCode: number;
  message: string;
};

type TagNames =
  | 'javascript'
  | 'css'
  | 'nextjs'
  | 'asynchronous'
  | 'api'
  | 'react'
  | 'tutorial'
  | 'redux';
