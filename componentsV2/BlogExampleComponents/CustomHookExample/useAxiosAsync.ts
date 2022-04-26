import { useCallback, useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';

const useAxiosAsync = <T>(url: string) => {
  const [joke, setJoke] = useState<T | null>(null);
  const [error, setError] = useState<AxiosError<Error> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchAJoke = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get<T>(url);
      setJoke(data);
      setIsLoading(false);
    } catch (error) {
      setError(error);
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchAJoke();
  }, [fetchAJoke]);

  return [{ data: joke, isLoading, error }, fetchAJoke] as const;
};

export default useAxiosAsync;
