import { NextPageContext } from 'next';
import React from 'react';

// eslint-disable-next-line no-undef
const Error = (props: ErrorProps) => {
  return (
    <>
      <h1>Custom error page: {props.statusCode}</h1>
      <p>{props.message}</p>
    </>
  );
};

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode, message: 'Noopeee' };
};

export default Error;
