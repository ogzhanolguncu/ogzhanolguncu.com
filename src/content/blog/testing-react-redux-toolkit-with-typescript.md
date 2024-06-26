---
pubDatetime: 2021-02-28
title: Testing a React/Redux Toolkit app with Typescript
slug: testing-react-redux-toolkit-with-typescript
tags:
  - redux
  - react
  - testing
  - typescript
  - tutorial
description: In this article we will test our React/Redux Toolkit app. Testing specifically slices and component that connected to react with Typescript and React Router.
---

This article is based on [Up & Running with React, Redux Toolkit, Typescript and React Router](https://ogzhanolguncu.com/blog/react-redux-toolkit-with-typescript). If you haven't check
that out yet, please go skim through this article first.

> If you have no idea about testing in react, you might wanna check that one as well. [Test your React components and APIs with React Testing Library, Jest, Typescript, and Axios
> ](https://ogzhanolguncu.com/blog/testing-with-react-testing-library-typescript-and-axios)

### Working Example

[Redux-Typescript example](https://codesandbox.io/embed/reduxtoolkit-typescript-test-mp4zo?autoresize=1&fontsize=14&hidenavigation=1&theme=dark&view=preview)

If you've done some component testing before, but you have no idea about how to test the components connected to **Redux Toolkit(RTK)** or slices then you are in the right place. Today we test our reduxified
components and slice reducers. For components, we'll put ourselves in user's shoes and will think and act like them. So, We are not going to test our components, but rather test the functionalities of them.
By doing this, we'll have a holistic view of our app, and we'll be able to see if everything integrates smoothly with each other.
For slices, we'll test them in an isolated environment(as units), supply them with their `ActionPayloads` accordingly and see if it really adds, edits or deletes.

Technologies we'll dabbling with will be **Typescript**, **RTK**, **React Router** and **React Testing Library(RTL)**. Since testing UI and UI related
things always sounds scary I'll try to smoothen this proccess as much as I can. Buckle up.

Project structure:

```
├─ src
│ ├─ App.tsx
│ ├─ components
│ │ ├─ BookInfo.tsx
│ │ └─ Navbar.tsx
│ ├─ hooks
│ │ └─ index.ts
│ ├─ index.tsx
│ ├─ logo.svg
│ ├─ pages
│ │ ├─ AddBook.tsx
│ │ └─ BookList.tsx
│ ├─ react-app-env.d.ts
│ ├─ redux
│ │ ├─ bookSlice.ts
│ │ └─ store.ts
│ ├─ reportWebVitals.ts
│ ├─ setupTests.ts
│ ├─ types.d.ts
│ └─ tests
│ │ ├─ reduxComponent.spec.tsx
│ │ ├─ reduxUnitTests.spec.ts
```

Before we go any further, first let's update some components from previous article.

### bookSlice.ts

```javascript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import { BookState } from '../types';

type initialStateType = {
  bookList: BookState[],
};

const bookList: BookState[] = [
  {
    id: '1',
    title: '1984',
    author: 'George Orwell',
  },
  {
    id: '2',
    title: "Harry Potter and the Philosopher's Stone",
    author: 'J. K. Rowling',
  },
  {
    id: '3',
    title: 'The Lord of the Rings',
    author: 'J.R.R Tolkien',
  },
];

const initialState: initialStateType = {
  bookList,
};

export const bookSlice = createSlice({
  name: 'book',
  initialState,
  reducers: {
    addNewBook: (state, action: PayloadAction<BookState>) => {
      state.bookList.push(action.payload);
    },
    updateBook: (state, action: PayloadAction<BookState>) => {
      const {
        payload: { title, id, author },
      } = action;

      state.bookList = state.bookList.map((book) =>
        book.id === id ? { ...book, author, title } : book,
      );
    },
    deleteBook: (state, action: PayloadAction<{ id: string }>) => {
      state.bookList = state.bookList.filter((book) => book.id !== action.payload.id);
    },
  },
});

export const { addNewBook, updateBook, deleteBook } = bookSlice.actions;

export const selectBookList = (state: RootState) => state.book.bookList;

export default bookSlice.reducer;
```

I've updated `ids` of `initalState`, previously it was `uuid()` which was getting generated randomly. But we need a constant id for testing. I usually make a fixture file to
place those constant variables, but I did not want to make things complicated.

### AddBook.tsx

```javascript
<Heading color="white" data-testid="header">
  {id ? "Update Book" : "Add Book"}
</Heading>
```

I've changed title to conditional render, so we can check if we are on the add or update page.

That was all the changes. Let's start testing our `bookSlice`.

## Testing Slice

### reduxUnitTests.spec.ts

```javascript
import { store } from "../redux/store";
import { deleteBook, updateBook, addNewBook } from "../redux/bookSlice";

test("Updates a books author and title", () => {
  let state = store.getState().book;
  const unchangedBook = state.bookList.find(book => book.id === "1");
  expect(unchangedBook?.title).toBe("1984");
  expect(unchangedBook?.author).toBe("George Orwell");

  store.dispatch(updateBook({ id: "1", title: "1985", author: "George Bush" }));
  state = store.getState().book;
  let changeBook = state.bookList.find(book => book.id === "1");
  expect(changeBook?.title).toBe("1985");
  expect(changeBook?.author).toBe("George Bush");

  store.dispatch(updateBook({ id: "1", title: "1984", author: "George Orwell" }));
  state = store.getState().book;
  const backToUnchangedBook = state.bookList.find(book => book.id === "1");

  expect(backToUnchangedBook).toEqual(unchangedBook);
});

test("Deletes a book from list with id", () => {
  let state = store.getState().book;
  const initialBookCount = state.bookList.length;

  store.dispatch(deleteBook({ id: "1" }));
  state = store.getState().book;

  expect(state.bookList.length).toBeLessThan(initialBookCount); // Checking if new length smaller than inital length, which is 3
});

test("Adds a new book", () => {
  let state = store.getState().book;
  const initialBookCount = state.bookList.length;

  store.dispatch(addNewBook({ id: "4", author: "Tester", title: "Testers manual" }));
  state = store.getState().book;
  const newlyAddedBook = state.bookList.find(book => book.id === "4");
  expect(newlyAddedBook?.author).toBe("Tester");
  expect(newlyAddedBook?.title).toBe("Testers manual");
  expect(state.bookList.length).toBeGreaterThan(initialBookCount);
});
```

We got three different test cases:

- Updating a book with given `author`, `title` and `id`.
- Deleting a book with given `id`
- Adding a book with given `author`, `title` and `id`

In test `Updates a books author and title`, we fetch `bookList` state from `store`, then we find the book with id of `1`, and then since we already know id `1` book is `1984` and author is `George Orwell`
we check that if it's true.

Then, we `dispatch(updateBook({ id: '1', title: '1985', author: 'George Bush' }));` and check again with new values. Then convert it back to first state to check against original
state.

In test `Deletes a book from list with id`, all we do is `dispatch` a delete action with id and check `initialLength` and `updatedLength` if updatedLength is lower than ìnitial
we are good to go.

In test `Adds a new book`, we `dispatch` add action, then check for newly added values and finally checking `initialLength` and `updatedLength` to see if new length is greater.

## Testing Reduxified Component

```javascript
import {
  render,
  screen,
  fireEvent,
  RenderResult,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import BookInfo from '../components/BookInfo';
import AddBook from '../pages/AddBook';
import { Route, MemoryRouter } from 'react-router-dom';

import { store } from '../redux/store';
import { BookState } from '../types';

const renderBook = (book: BookState): RenderResult =>
  render(
    <Provider store={store}>
      <BookInfo title={book.title} author={book.author} id={book.id} />
    </Provider>
  );

const renderAddBook = (): RenderResult =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <AddBook />
      </MemoryRouter>
    </Provider>
  );

const renderUpdateBook = (id: string): RenderResult =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/update-book/${id}`]}>
        <Route path="/update-book/:id">
          <AddBook />
        </Route>
      </MemoryRouter>
    </Provider>
  );

const getABook = (bookId: string): BookState => {
  const book = store
    .getState()
    .book.bookList.find((book) => book.id === bookId);
  expect(book).not.toBeUndefined();
  return book as BookState;
};



test('Renders BookInfo', () => {
  const book = getABook('1');
  renderBook(book);
  expect(screen.getByText('1984')).toHaveTextContent('1984');
});



test('AddBook page', () => {
  renderAddBook();
  const initialLength = store.getState().book.bookList.length;

  let titleInput = screen.getByPlaceholderText('The Lord of the Rings'); // Since we know placeholder is already The Lord of the Rings so we can query by it
  expect(titleInput).toBeInTheDocument();
  fireEvent.change(titleInput, { target: { value: 'Test Title' } });
  expect(titleInput).toHaveValue('Test Title');

  let authorInput = screen.getByPlaceholderText('J.R.R Tolkien'); // Since we know placeholder is already J.R.R Tolkien
  expect(authorInput).toBeInTheDocument();
  fireEvent.change(authorInput, { target: { value: 'Test Author' } });
  expect(authorInput).toHaveValue('Test Author');

  let submitButton = screen.getByText('Submit');
  fireEvent.click(
    submitButton,
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    })
  );

  let book = store.getState().book.bookList.length;
  expect(book).toBeGreaterThan(initialLength);
});



test('UpdateBook page', () => {
  const bookId = '1';
  renderUpdateBook(bookId);
  let updateBookData = getABook(bookId);

  const updateBookText = screen.getByTestId('header');
  expect(updateBookText).toHaveTextContent('Update Book');

  let titleInput = screen.getByDisplayValue(updateBookData!.title!); //Making sure by finding titleInput with prepopulated title
  expect(titleInput).toBeInTheDocument();
  fireEvent.change(titleInput, { target: { value: 'Test Title' } }); //And changing its data
  expect(titleInput).toHaveValue('Test Title');

  let authorInput = screen.getByDisplayValue(updateBookData!.author!); //Making sure by finding authorInput with prepopulated author

  expect(authorInput).toBeInTheDocument();
  fireEvent.change(authorInput, { target: { value: 'Test Author' } }); //And changing its data
  expect(authorInput).toHaveValue('Test Author');

  let submitButton = screen.getByText('Submit');
  fireEvent.click(
    submitButton,
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    })
  );

  updateBookData = getABook(bookId);
  expect(updateBookData.title).toBe('Test Title'); // Checking the book with id=1 now has Test Title
  expect(updateBookData.author).toBe('Test Author'); // Checking the book with id=1 now has Test Author
});
```

Before we begin tests, we need to make our utility functions `renderAddBook`, `renderUpdateBook`, `renderBook` and `getABook`. In renderUpdateBook and renderAddBook
we've used [Memory Router](https://reactrouter.com/web/api/MemoryRouter) to test our React Router as well.

Our first test `Renders BookInfo`, renders a book with the id of 1, which is **1984** all we have to do check whether there is an element associated with **1984** or not.

In test `AddBook page`, we first fetch our input fields by placeholders since they are already defined we can easily access it. Then we `fireEvent` to fill them up, then as if it's real user, we press submit button, and finally like we've previously done in slice we check `bookList`'s length to see if it incremented.

In test `UpdateBook page`, this one is pretty similar to `AddBook page`, but we first fetch book id that comes from `useParams` if it's really there, we know we would have
prepopulated input fields with associated id information in our case it's `1984` and `George Orwell`. And we know if we are updating, title should be `Update Book` we also check
that one as well. Then we can values of fields and trigger submit button click like we do earlier, and finally checking the `id=1` is really has title of `Test Title` and author of `Test Author`.

Now if you are done all you have to do `yarn test`. We now have a working test suite. They will keep running as you are working,
and they will constantly check your code against test cases in case anything breaks.
