---
pubDatetime: 2021-02-25
title: Up & Running with React, Redux Toolkit, Typescript and React Router
slug: react-redux-toolkit-with-typescript
tags:
  - typescript
  - redux
  - tutorial
  - react
description: All React apps need a state management library such as Redux Toolkit and type-safety with Typescript. Today we will learn how to use them together.
---

[Redux-Typescript example](https://codesandbox.io/embed/react-reduxtoolkit-typescript-ow6nm?autoresize=1&fontsize=14&hidenavigation=1&theme=dark&view=preview)

In this article, we will learn how to use **React**, **Typescript** and **Redux Toolkit** together. The goal is to build a basic CRUD app called **Library App** where we store our book's authors and titles, and while doing so, I will demonstrate the ease of using **Typescript** with other technologies. I won't be diving into details of **Redux**, but rather show how RTK (Redux Toolkit) simplifies our lives. We will also
use **React Router** to navigate between pages and **Chakra UI** to build our basic UI.

I'm hoping by the end of this article you'll find RTK and Typescript less intimidating and have more courage to start your next project with these technologies.

> I'm assuming you have basic knowledge of React and React Router.

Let's install all the dependencies we:

```bash
yarn add @chakra-ui/icons @chakra-ui/react @emotion/react @emotion/styled @reduxjs/toolkit framer-motion react-redux react-router-dom uuid @types/react-redux @types/react-router-dom @types/uuid
```

Project structure:

```
├─ src
│  ├─ App.tsx
│  ├─ components
│  │  ├─ BookInfo.tsx
│  │  └─ Navbar.tsx
│  ├─ hooks
│  │  └─ index.ts
│  ├─ index.tsx
│  ├─ pages
│  │  ├─ AddBook.tsx
│  │  └─ BookList.tsx
│  ├─ react-app-env.d.ts
│  ├─ redux
│  │  ├─ bookSlice.ts
│  │  └─ store.ts
│  └─ types.d.ts
```

Let's start with `index.js` first. We will setup our Redux and Chakra UI provider.

### index.js

```javascript
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { Provider } from "react-redux";
import { store } from "./redux/store";

const theme = extendTheme({
  // Set background to blackish color.
  styles: {
    global: {
      "html, body": {
        backgroundColor: "rgb(26,32,44)",
      },
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
```

Let's define our store and slice(reducer).

### store.ts

```typescript
import { configureStore } from "@reduxjs/toolkit";
import { bookSlice } from "./bookSlice";

export const store = configureStore({
  reducer: {
    book: bookSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>; // A global type to access reducers types
export type AppDispatch = typeof store.dispatch; // Type to access dispatch
```

Now, let's move onto our reducer.

### bookSlice.ts

```typescript
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { v4 as uuidv4 } from "uuid";
import { BookState } from "../types";

//Defining our initialState's type
type initialStateType = {
  bookList: BookState[];
};

const bookList: BookState[] = [
  {
    id: uuidv4(),
    title: "1984",
    author: "George Orwell",
  },
  {
    id: uuidv4(),
    title: "Harry Potter and the Philosopher's Stone",
    author: "J. K. Rowling",
  },
  {
    id: uuidv4(),
    title: "The Lord of the Rings",
    author: "J.R.R Tolkien",
  },
];

const initialState: initialStateType = {
  bookList,
};

export const bookSlice = createSlice({
  name: "book",
  initialState,
  reducers: {
    addNewBook: (state, action: PayloadAction<BookState>) => {
      state.bookList.push(action.payload);
    },
    updateBook: (state, action: PayloadAction<BookState>) => {
      const {
        payload: { title, id, author },
      } = action;

      state.bookList = state.bookList.map(book =>
        book.id === id ? { ...book, author, title } : book
      );
    },
    deleteBook: (state, action: PayloadAction<{ id: string }>) => {
      state.bookList = state.bookList.filter(book => book.id !== action.payload.id);
    },
  },
});

// To able to use reducers we need to export them.
export const { addNewBook, updateBook, deleteBook } = bookSlice.actions;

//Selector to access bookList state.
export const selectBookList = (state: RootState) => state.book.bookList;

export default bookSlice.reducer;
```

Our `bookSlice` accepts `name` as a `key` to distinguish this particular slice, `initialState` to kick-start the slice and, of course `reducers` where we define our
`actions`. `reducer` functions, just like regular reducers accepts state and action, but since we are using Typescript we also need to define types for our `PayloadAction`.
Let's quickly define our types in `d.ts` file.

### types.d.ts

```typescript
export type BookState = {
  id: string;
  title: string | undefined;
  author: string | undefined;
};
```

And, of course create a file for hooks as well.

### hooks/index.ts

```typescript
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";

//useDispatch hook with types.
export const useAppDispatch = () => useDispatch<AppDispatch>();
//useSelector hook with types
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

We've finished the Redux and hooks part. It's time to move on to components. Now, all we have to do is create two component, one for `Navbar` and one for `BookInfo`, to display the book's data.

### Navbar.tsx

```javascript
import { Button, Flex, Box, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <Flex
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      width="100%"
      as="nav"
      p={4}
      mx="auto"
      maxWidth="1150px"
    >
      <Box>
        <Link to="/">
          <Button
            fontWeight={["medium", "medium", "medium"]}
            fontSize={["xs", "sm", "lg", "xl"]}
            variant="ghost"
            _hover={{ bg: "rgba(0,0,0,.2)" }}
            padding="1"
            color="white"
            letterSpacing="0.65px"
          >
            <Text fontSize={["xl", "2xl", "2xl", "2xl"]} mr={2}>
              🦉
            </Text>
            Library App
          </Button>
        </Link>
      </Box>

      <Box>
        <Link to="/">
          <Button
            fontWeight={["medium", "medium", "medium"]}
            fontSize={["xs", "sm", "lg", "xl"]}
            variant="ghost"
            _hover={{ bg: "rgba(0,0,0,.2)" }}
            p={[1, 4]}
            color="white"
          >
            List Books
          </Button>
        </Link>
        <Link to="/add-new-book">
          <Button
            fontWeight={["medium", "medium", "medium"]}
            fontSize={["xs", "sm", "lg", "xl"]}
            variant="ghost"
            _hover={{ bg: "rgba(0,0,0,.2)" }}
            p={[1, 4]}
            color="white"
          >
            Add Book
          </Button>
        </Link>
      </Box>
    </Flex>
  );
};

export default Navbar;
```

A simple navbar component that contains links to navigate between pages.

### BookInfo.tsx

```javascript
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Box, Heading, IconButton, Text } from '@chakra-ui/react';

import { useAppDispatch } from '../hooks';
import { deleteBook } from '../redux/bookSlice';
import { useHistory } from 'react-router-dom';

const BookInfo = ({
  title,
  author,
  id,
  ...rest
}: {
  title: string | undefined,
  author: string | undefined,
  id: string,
}) => {
  const dispatch = useAppDispatch(); // To able to call reducer, functions we use our hook called useAppDispatch
  const history = useHistory();

  //Redirecting user to /update-book route with id parameter.
  const redirect = (id: string) => {
    history.push(`/update-book/${id}`);
  };

  return (
    <Box p={5} justifyContent="space-between" d="flex" shadow="md" borderWidth="1px" {...rest}>
      <Box d="flex" flexDirection="column">
        <Heading fontSize="xl">{title}</Heading>
        <Text mt={4}>{author}</Text>
      </Box>
      <Box>
        <IconButton
          color="#1a202c"
          aria-label=""
          icon={<DeleteIcon />}
          marginRight="1rem"
          onClick={() => dispatch(deleteBook({ id }))}
        />
        <IconButton
          color="#1a202c"
          aria-label=""
          icon={<EditIcon />}
          onClick={() => redirect(id)}
        />
      </Box>
    </Box>
  );
};

export default BookInfo;
```

We now need a place to use our components. Therefore, we will create two page component `BookList` page
to display books in our library and `AddBook` to add new books and update the old ones.

### BookList.tsx

```javascript
import { Box, Button, Flex, Heading, Stack } from "@chakra-ui/react";

import { Link } from "react-router-dom";
import { useAppSelector } from "../hooks";
import BookInfo from "../components/BookInfo";

const BookList = () => {
  // If we had any other state like book, we could have select it same way we select book. For example, author would be  useAppSelector((state) => state.author.authorNames)
  const bookList = useAppSelector(state => state.book.bookList);

  return (
    <Flex height="100vh" justifyContent="center" alignItems="center" flexDirection="column">
      <Box width="50%">
        <Box d="flex" flexDirection="row" justifyContent="space-between" marginBottom="20px">
          <Heading color="white">Book List</Heading>
          <Link to="/add-new-book">
            <Button paddingX="3rem">Add</Button>
          </Link>
        </Box>
        <Box rounded="md" bg="purple.500" color="white" px="15px" py="15px">
          <Stack spacing={8}>
            {bookList.map(book => (
              <BookInfo key={book.id} title={book.title} author={book.author} id={book.id} />
            ))}
          </Stack>
        </Box>
      </Box>
    </Flex>
  );
};

export default BookList;
```

We've used `BookInfo` component that we defined earlier.

### AddBook.tsx

```javascript
import { Box, Button, Flex, FormControl, FormLabel, Heading, Input } from '@chakra-ui/react';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { addNewBook, updateBook } from '../redux/bookSlice';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useHistory } from 'react-router-dom';

const AddBook = () => {
  const { id } = useParams<{ id: string }>(); //If user comes from /update-book, we will catch id of that book here.
  const history = useHistory();
  const dispatch = useAppDispatch();
  const book = useAppSelector((state) => state.book.bookList.find((book) => book.id === id)); // Selecting particular book's information to prefill inputs for updating.

  const [title, setTitle] = useState<string | undefined>(book?.title || ''); // We are initializing useStates if book variable has title or author.
  const [author, setAuthor] = useState<string | undefined>(book?.author || '');

  const handleOnSubmit = () => {
    if (id) {
      editBook();
      return;
    }
    dispatch(addNewBook({ author, title, id: uuidv4() }));
    clearInputs();
  };

  const editBook = () => {
    dispatch(updateBook({ author, title, id }));
    clearInputs();
    history.push('/');
  };

  const clearInputs = () => {
    setTitle('');
    setAuthor('');
  };

  return (
    <Flex height="100vh" justifyContent="center" alignItems="center" flexDirection="column">
      <Box width="50%">
        <Box d="flex" flexDirection="row" justifyContent="space-between" marginBottom="20px">
          <Heading color="white">Add Book</Heading>
        </Box>
        <FormControl isRequired>
          <FormLabel color="white">Title</FormLabel>
          <Input
            value={title}
            color="white"
            placeholder="The Lord of the Rings"
            onChange={(e) => setTitle(e.currentTarget.value)}
          />
          <FormLabel color="white" marginTop={4}>
            Author
          </FormLabel>
          <Input
            value={author}
            color="white"
            placeholder="J.R.R Tolkien"
            onChange={(e) => setAuthor(e.currentTarget.value)}
          />
        </FormControl>
        <Button marginTop={4} colorScheme="teal" type="submit" onClick={handleOnSubmit}>
          Submit
        </Button>
      </Box>
    </Flex>
  );
};

export default AddBook;
```

This one is a bit trickier than `BookList`. Since we do adding and updating operations on the same page it may look complicated and bloated at first, but it's quite simple and elegant. All we do is; if there are any
data such as `author`, `title` meaning we are editing the book, and we fill inputs accordingly. If there is no data, we enter a title and author and add them to `bookList` with dispatch action.

It's time to merge all of them into one.

### App.tsx

```javascript
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import AddBook from "./pages/AddBook";
import BookList from "./pages/BookList";

function App() {
  return (
    <Router>
      <Navbar />
      <Switch>
        <Route path="/" exact component={BookList} />
        <Route path="/add-new-book" component={AddBook} />
        <Route path="/update-book/:id" component={AddBook} />
      </Switch>
    </Router>
  );
}

export default App;
```

We now have a working project with React, Typescript and Redux Toolkit. Thanks for bearing with me. I hope I encouraged you to use RTK with Typescript in your next project.
