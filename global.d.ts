type IsPopular = {
  popular?: boolean;
};

type Blog = {
  id: number;
  title: string;
  date: string;
  decription: string;
  tags: string[];
};

type ErrorProps = {
  statusCode: number;
  message: string;
};
