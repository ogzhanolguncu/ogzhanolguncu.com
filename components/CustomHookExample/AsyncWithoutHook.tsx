import { Button, Flex } from '@chakra-ui/react';
import React from 'react';

import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';

type JokeType = {
  created_at: string;
  icon_url: string;
  id: string;
  url: string;
  value: string;
};

function AsyncWithoutHook() {
  const [joke, setJoke] = useState<JokeType | null>(null);
  const [error, setError] = useState<AxiosError<Error> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchAJoke = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get<JokeType>('https://api.chucknorris.io/jokes/random');
      setJoke(data);
      setIsLoading(false);
    } catch (error) {
      setError(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAJoke();
  }, []);

  if (error) return <Flex>{error}</Flex>;
  if (isLoading) return <Flex>Loading...</Flex>;

  return (
    <Flex flexDirection="column" boxShadow="outline" rounded="md" width="50%" padding="1rem">
      {joke?.value}
      <Button onClick={fetchAJoke}>Fetch Again!!!</Button>
    </Flex>
  );
}

export default AsyncWithoutHook;
