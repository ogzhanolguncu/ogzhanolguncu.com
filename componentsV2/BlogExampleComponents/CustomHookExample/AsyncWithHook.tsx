import { Button, Flex } from '@chakra-ui/react';
import React from 'react';

import useAxiosAsync from './useAxiosAsync';

type JokeType = {
  created_at: string;
  icon_url: string;
  id: string;
  url: string;
  value: string;
};

function AsyncWithoutHook() {
  const [{ data, isLoading, error }, fetchAJoke] = useAxiosAsync<JokeType>(
    'https://api.chucknorris.io/jokes/random',
  );

  if (error) return <Flex>{error}</Flex>;
  if (isLoading) return <Flex>Loading...</Flex>;

  return (
    <Flex flexDirection="column" boxShadow="outline" rounded="md" width="50%" padding="1rem">
      {data?.value}
      <Button onClick={fetchAJoke}>Fetch Again!!!</Button>
    </Flex>
  );
}

export default AsyncWithoutHook;
