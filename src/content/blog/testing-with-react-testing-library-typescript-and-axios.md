---
pubDatetime: 2020-11-18
title: Test your React components and APIs with React Testing Library, Jest, Typescript, and Axios
slug: testing-with-react-testing-library-typescript-and-axios
tags:
  - react
  - testing
  - typescript
  - tutorial
description: Testing our UI components and API requests, using React Testing Library, Jest and Ts-Jest. And, of course, we`ll be using Typescript. Axios, RTL, Typescript
---

> “Always code as if the guy who ends up maintaining your code will be a violent psychopath who knows where you live.” (Martin Golding)

Live Example: [Codesandbox](https://codesandbox.io/s/flamboyant-goldwasser-ucu19)

I've always been curious about how testing works in React and how to get used to the habit of writing tests.
So, finally gathered my courage and started my journey to testing in React. In my first attempt
I came across with this incredible article written by Kent C. Dodds [Introducing The React Testing Library](https://kentcdodds.com/blog/introducing-the-react-testing-library)
The article was super insightful and has given me some direction to go, then I skim through lots of other articles about React Testing Library, and in the end, I had enough knowledge to
make my own toy project.

Before we dive into React Testing Library, let's first talk about **_"What Is Testing"_**.

## Testing

Testing is one of the crucial parts of the software development process and mostly overlooked by developers.
Usually, developers avoid writing tests, because it takes more time than just simply developing a product, if you are not familiar with tests.
But there is only one way to make sure your code works as you keep working on it.
Imagine a scenario where you develop a new component that works with your old component, you might be somehow modified your components, so how do you make sure your old component is working as you expected?.
You can't if you avoid writing tests. Period.

So, few gotchas:

- Write test and write them early
- Write your tests first
- Write tests that resemble the way your software is used

## React Testing Library

RTL(React Testing Library) created to test our React components, and unlike other alternatives like [Enzyme](https://www.npmjs.com/package/enzyme) RTL is very intuitive and simple.
Even, its setup is simple and ships with CRA(Create React App).

Let's get started.

To start a new project with Typescript, run one of the following command.

```bash
npx create-react-app testing-with-chuck --template typescript

# or

yarn create react-app testing-with-chuck --template typescript
```

And, add following dependencies.

```bash
yarn add @chakra-ui/react @emotion/react @emotion/styled framer-motion axios ts-jest
```

We'll use [Chakra UI](https://chakra-ui.com/) for styling, axios for API requets and ts-jest for mocking jest.

Project Structures

```bash

src -->
        |-->__tests__
        |             |--> Home.spec.tsx
        |             |--> jokeApi.spec.tsx

        |-->components
        |             |--> Home.tsx

        |-->fixtures
        |             |--> Joke.ts

        |-->services
        |             |--> jokeApi.ts

        |-->App.tsx
        |-->react-app-env.d.ts

```

I'll not explain how React works, just provide some sample code to focus on testing.

### App.tsx

```tsx
import { ChakraProvider } from "@chakra-ui/react";
import React from "react";
import Home from "./components/Home";

function App() {
  return (
    <ChakraProvider>
      <Home />
    </ChakraProvider>
  );
}

export default App;
```

## Components

### Home.tsx

```tsx
import React, { useState, useEffect } from "react";
import { Box, Button, Flex, Skeleton, Text } from "@chakra-ui/react";
import { getARandomJoke } from "../services/jokeApi";

type ApiType = {
  categories: [];
  created_at: Date;
  id: string;
  updated_at: Date;
  value: string;
};

const Home = () => {
  const [joke, setJoke] = useState<ApiType>();
  const [loading, setLoading] = useState(false);

  const getARandom = async () => {
    setLoading(true);
    const data = await getARandomJoke();
    setLoading(false);
    return data;
  };

  const handleRefresh = async () => {
    const joke = await getARandomJoke();
    setJoke(joke);
  };

  useEffect(() => {
    getARandom().then(response => setJoke(response));
  }, []);

  return (
    <Flex
      justify="center"
      alignItems="center"
      height="100vh"
      backgroundColor="#fff4da"
      data-testid="jokeContainer"
    >
      <Box d="flex" flexDirection={["column", "row"]} padding="1.2rem">
        <Skeleton
          isLoaded={!loading}
          startColor="#000"
          endColor="#fff4da"
          height="40px"
          marginX="1rem"
        >
          <Text
            maxWidth="800px"
            as="p"
            alignSelf="center"
            fontSize="1.5rem"
            marginRight="1rem"
            textDecoration="underline"
            data-testid="jokeText"
          >
            {joke?.value}
          </Text>
        </Skeleton>
        <Button
          marginTop={["1.5rem", 0, 0, 0]}
          alignSelf="center"
          variant="outline"
          fontSize="1rem"
          onClick={() => handleRefresh()}
          disabled={loading}
          borderColor="#2a2c2e"
          borderRadius="0"
          _hover={{ backgroundColor: "#e8daba" }}
        >
          Refresh
        </Button>
      </Box>
    </Flex>
  );
};

export default Home;
```

## Fixtures

Point of defining our fixtures is we want to simulate Axios response since we don't have the luxury of requesting to API every time our tests run. Let's define our fixtures.

### Joke.ts

```typescript
import { ApiType } from "../services/jokeApi";

export const singularJoke: ApiType = {
  value: "Chuck Norris invented the internet so people could talk about how great Chuck Norris is.",
  categories: [],
  created_at: new Date(),
  id: "1212",
  updated_at: new Date(),
};

export const emptySingularStory: ApiType = {
  value: "",
  categories: [],
  created_at: new Date(),
  id: "1212",
  updated_at: new Date(),
};
```

## Services

### jokeApi.ts

```typescript
import axios from "axios";

const URI = "https://api.chucknorris.io/jokes/random";

export type ApiType = {
  categories: [];
  created_at: Date;
  id: string;
  updated_at: Date;
  value: string;
};

export const getARandomJoke = async () => {
  const { data } = await axios.get<ApiType>(URI);
  return data;
};
```

Looks like, we are ready. Let's start writing our first test.

## Tests

### Home.spec.tsx

```tsx
import React from "react";
import Home from "../components/Home";
import { render, cleanup, waitFor, act, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { singularJoke, emptySingularStory } from "../fixtures/Joke";
import { getARandomJoke } from "../services/jokeApi";
import { mocked } from "ts-jest/utils";

afterEach(() => {
  cleanup;
  jest.resetAllMocks();
});

jest.mock("../services/jokeApi");

const mockedAxios = mocked(getARandomJoke);

test("Renders home correctly", async () => {
  await act(async () => {
    const { getByTestId } = render(<Home />);
    expect(getByTestId("jokeContainer")).toBeInTheDocument();
  });
});

test("Renders a joke correctly", async () => {
  mockedAxios.mockImplementationOnce(() => Promise.resolve(singularJoke));

  await act(async () => {
    const { getByText } = render(<Home />);
    await waitFor(() => [
      expect(
        getByText(
          "Chuck Norris invented the internet so people could talk about how great Chuck Norris is."
        )
      ).toBeTruthy(),
    ]);
  });
});

test("Renders empty a joke correctly", async () => {
  mockedAxios.mockImplementationOnce(() => Promise.resolve(emptySingularStory));

  await act(async () => {
    render(<Home />);
    await waitFor(() => [expect(screen.getByTestId("jokeText")).toHaveTextContent("")]);
  });
});
```

Before we start writing our test cases, we should first think about which functionalities we want to test.

- We want our Home component getting rendered correctly in the DOM.
- We want our Home component getting rendered with Chuck Norris joke and without a joke

Quick Note:

> We need to give _data-testid_ to elements we want to test to query and locate them in the DOM. If you scroll up, you will see that we've given _jokeContainer_ to _Home_ components div and
> _jokeText_ to _Text_ component renders our Chuck Norris Joke.

Let's go through line by line:

`afterEach` => After each test case this function cleans the DOM and reset all mocks, so in the next test we don't have to deal with older versions of DOM or mocks.

`jest.mock('../services/jokeApi');` => In order to mock our Axios requests, we import it this way.

`mocked(getARandomJoke)` => With the help of _ts-jest_, we mock our Axios function to call it inside test cases.

`test()` => Test method receives _name_ and _callback function_

`act()` => If your code contains `useState()`,`useEffect()` or any other code that updates your components use `act()`.

`const { getByTestId } = render(<Home />)` => We tell to our `Home` component that we want to query it by `testid`.

`expect(getByTestId('jokeContainer')).toBeInTheDocument();` => This is actually self explanatory, we tell that we expect Element with `jokeContainer` id to be in the document.

If we type `yarn test` now, you will see that `PASS src/__tests__/home.spec.tsx`.

### Let's move on to the second case.

`mockedAxios.mockImplementationOnce(()`
`=> Promise.resolve(singularJoke));` => We call method called `mockImplementationOnce()` to mock a request, and tell it to return a single joke.

`const { getByText } = render(<Home />);` => Like `getByTestId` we can also query by text using `getByText`.

`waitFor()` => If we are having async requests inside our component we should use `waitFor()` to await a promise.

`toBeTruthy()` => Since, our `singularJoke` contains joke exactly like this _Chuck Norris invented the internet so people could talk about how great Chuck Norris is._,
and we know this is truthy and we want to ensure a value is true in a boolean context.

### Let's move to our the third case.

`mockedAxios.mockImplementationOnce(()`
`=> Promise.resolve(emptySingularStory));` => We want to test empty joke case.

Only difference between our second and third test case is `toHaveTextContent`. Since, we want to check given element has a text content or not,
and since we don't have any text inside _jokeText_ `toHaveTextContent` will fulfill our test case.

### Testing Axios requests in isolation

```tsx
import { singularJoke, emptySingularStory } from "../fixtures/Joke";
import { getARandomJoke } from "../services/jokeApi";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Chuck Norris Api", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("getStory functionality", () => {
    it("requests and gets a joke from the chuckNorris Api", async () => {
      mockedAxios.get.mockImplementation(() => Promise.resolve({ data: singularJoke }));

      const entity = await getARandomJoke();
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(entity).toEqual(singularJoke);
    });

    it("does not retrieve a joke from the Api", async () => {
      mockedAxios.get.mockImplementation(() => Promise.resolve({ data: emptySingularStory }));

      const entity = await getARandomJoke();
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(entity).toEqual(emptySingularStory);
    });
  });
});
```

As can be seen, we have two test cases. Our first test case is to call the API and make sure it returns a joke.
Second test case is also similar, but make sure API does not return a joke.

## Final Thoughts

Tests matters, because it makes our code future proof to incoming changes, refactorings.
So, write tests for things that might break in the future. Don't write tests for everything.
