---
pubDatetime: 2021-03-18
title: Introduction to Custom Hooks
slug: intro-to-custom-hooks
tags:
  - typescript
  - react
description: In this article we will learn how to setup our first custom hook. We will convert axios into re-usable hook with typescript and generics.
---

Custom hooks become a staple in our lives after we got introduced to hooks such as **useEffect**, **useState**, **useReducer**. Regardless of their purposes, custom hooks should start with `use`
such as `useAxiosAsync` or `useToggle`. Therefore we can easily perceive that this is a custom hook. We could name them differently, but that would make them harder to detect at the first sight this is why the community following that convention.

Like in any other area of programming we always want to make things re-usable by detaching them from the main code. We, either turn them into functions or classes, but we are dealing with states so we want to be able to utilize react related stuff as well.

Thus we can achieve a couple of things:

- DRY(Don't repeat yourself)
- Reduced coupling
- Modular code
- Testable code

Let's take a look at this easy example:

### useToggle

```javascript
import { Alert, Button, Flex, Text } from "@chakra-ui/react";

function App() {
  const [on, toggle] = React.useState(false);
  return (
    <div>
      <span>{on ? "ON" : "OFF"}</span>
      <button onClick={() => toggle(prevState => !prevState)}>TOGGLE</button>
      <button onClick={() => toggle(true)}>SET TOGGLE ON</button>
      <button onClick={() => toggle(false)}>SET TOGGLE OFF</button>
    </div>
  );
}
export default App;
```

This example is very different from where we toggle for `Loading` state while making a request for our APIs. If we want this to be a custom hook, all we have to do is
take `useState` out of this component and check for conditions while toggling state.

```javascript
import { useState } from 'react';

const useToggle = (initialState = false) => {
  const [toggle, setToggle] = useState(initialState);

  const toggleState = (state?: false | true) => {
    setToggle(typeof state === 'boolean' ? state : !toggle);
  };
  return [toggle, toggleState] as const;
};

export default useToggle;
```

Now, using our custom hook in the same component as we did before.

```javascript
import { Alert, Button, Flex, Text } from "@chakra-ui/react";
import useToggle from "./useToggle";

function ToggleWithHook() {
  const [on, toggle] = useToggle(false);
  return (
    <div>
      <span>{on ? "ON" : "OFF"}</span>
      <button onClick={() => toggle()}>TOGGLE</button>
      <button onClick={() => toggle(true)}>SET TOGGLE ON</button>
      <button onClick={() => toggle(false)}>SET TOGGLE OFF</button>
    </div>
  );
}

export default ToggleWithHook;
```

Let's take a look at a more complex example, where we also use `Generics` in Typescript.

### useAxiosAsync

Without a custom hook.

```typescript
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
```

Now, using custom hooks, again.

```typescript
import { useCallback, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";

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
```

```typescript
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

function AsyncWithHook() {
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

export default AsyncWithHook;
```

We've shortened our component quite a bit by moving state related things to our `useAxiosAsync`. So, we no longer need to deal with business logic in our component and of course we can use
this `useAxiosAsync` whenever we want.

## Roundup

In the essence, custom hooks are just `useState` and `useEffect` **(of course other hooks as well)** hooks moved to another file to reduce the amount of code in components.
So, if something bloating your component or you keep using same logic in other components, it's time to convert it into custom hook.
