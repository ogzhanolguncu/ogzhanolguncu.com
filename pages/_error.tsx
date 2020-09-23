import { Error401, Error404 } from '@components/index';
import { NextPageContext } from 'next';
import React from 'react';

// eslint-disable-next-line no-undef
const Error = ({ statusCode }: ErrorProps) => {
  if (statusCode === 401) return <Error401 />;
  else return <Error404 />;
};

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
