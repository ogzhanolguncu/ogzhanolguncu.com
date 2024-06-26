---
pubDatetime: 2021-10-03
title: Function Composition in Javascript
slug: function-composition-javascript
tags:
  - tutorial
  - functional_programming
  - javascript
description: In this article we`ll deep dive into function composition, pipes, currying and partial applications with examples from real world.
---

After learning map, reduce and higher-order functions, you finally stepped into the gate of functional programming. As you keep delving deeper you stumbled upon composing and piping, and, you start to wonder why one even uses compose. Function composition(compose) allows us to define reusable, testable and maintainable functions. All those perks are the motivation behind functional programming's existence.

This whole process is quite parallel to what we do in math.

```bash
f(x) = x + 2
g(x) = x * 2

h(x) = f(g(x)) // If x is 2, then result will be 6.

```

Just like in this example, compose function uses the output of the functions as input for the next function. Let's see it in action.

```json
[
  {
    "id": 1,
    "name": "Alice's Adventures in Wonderland",
    "completed": false
  },
  {
    "id": 2,
    "name": "The Fellowship of the Ring",
    "completed": true
  },
  {
    "id": 3,
    "name": "The Return of the King",
    "completed": false
  },
  {
    "id": 4,
    "name": "The Golden Compass",
    "completed": true
  },
  {
    "id": 5,
    "name": "1984",
    "completed": false
  }
]
```

Suppose we want to find completed book titles using regular ES6 it would be something like this:

```javascript
const completedBookTitles = book.filter(book => book.completed).map(book => book.name);
//  ["The Fellowship of the Ring", "The Golden Compass"]
```

We can even separate arrow functions to their own functions to make it more readable.

```javascript
const completedBooks = book => book.completed;
const completedBookNames = book => book.name;
const completedBookTitles = books.filter(completedBooks).map(completedBookNames);
//  ["The Fellowship of the Ring", "The Golden Compass"]
```

Or, we can compose them but, first, we need to make ourselves a brand new compose function.

```javascript
const compose =
  (...fns) =>
  val =>
    fns.reduceRight((acc, fn) => fn(acc), val);
```

Reduce works left-to-right, but, since composition works right-to-left we use `reduceRight` to reverse it. Now, let's demystify this function.
We will go step-by-step and start with `...fns`, what is this? If we are not certain about how many arguments will be received we tend to use
`...args`, but in our case, we are expecting functions instead of regular values. This is also called [rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters).

```javascript
const add = (a, b, c, ...args) => {
  console.log(args); // returns [4,5,6]
  return a + b + c;
};
add(1, 2, 3, 4, 5, 6);
```

### Currying

Now, we have another mysterious thing in our function, another arrow function. This thing actually called [currying](https://ogzhanolguncu.com/blog/using-curry-the-functional-way).
Let's quickly recap currying. Currying gives you ability to splitting your function calls into multiple calls and gives you ability to provide one argument at a time which gives you [unary](https://en.wikipedia.org/wiki/Unary_function) functions.

```javascript
const curriedAdd = x => y => x + y;

curriedAdd(1)(2); // returns 3
```

In the third part - `fns.reduceRight` - we are just iterating over functions which received by compose function and calling each function with
a given array which in our case it's our curried value - `val` -. Now, instead of chaining filter and map let's compose them.

```javascript
const completedBooks = books => books.filter(book => book.completed);
const bookNames = books => books.map(book => book.name);

const completedBookNames = compose(bookNames, completedBooks);
completedBookNames(books); // ["The Fellowship of the Ring", "The Golden Compass"]
```

By the way, if reading right to left feels weird don't worry I got you covered. There is another function called `pipe`, which works just like `compose` but in reverse.
All we have to do is use `reduce` instead of `reduceRight`.

```javascript
const pipe =
  (...fns) =>
  val =>
    fns.reduce((acc, fn) => fn(acc), val);
const completedBookNames = pipe(completedBooks, bookNames);
completedBookNames(books); // ["The Fellowship of the Ring", "The Golden Compass"]
```

If you dislike defining functions on top instead of using arrow function directly we can define our own `map` and `filter`.

```javascript
const map = fn => arr => arr.map(fn);
const filter = fn => arr => arr.filter(fn);

const completedBookNames = pipe(
  filter(book => book.completed),
  map(book => book.name)
);
completedBookNames(books); // ["The Fellowship of the Ring", "The Golden Compass"]
```

### Partial Application

We can even spice up our compose/pipe more with a partial application, by the way, partial application is just like currying allows you to make multiple function calls, but
also gives you an option to provide multiple arguments. In our case, we will provide only one argument for the sake of simplicity. Let's see it in the action.

```javascript
const log = val => console.log(val);
const reverseArray = isReverse => arr => (isReverse ? arr.reverse() : arr);
const reversed = reverseArray(true);

pipe(
  filter(book => book.completed),
  map(book => book.name),
  reversed,
  log
)(books); //  ['The Golden Compass', 'The Fellowship of the Ring'],
```

### Practical Examples

```javascript
const person = {
  name: "Jack The Ripper",
  location: "London",
};
```

Let's imagine we have a person object, and we have been requested to make few changes without mutating the object.
Because objects are passed around by their references which results in mutating the object and losing the previous version of the object which generates impure functions.
In functional programming, we always strive for pure functions. To overcome that hurdle, we need to make a shallow copy of our object first, then mutate the copied object.

```javascript
const person = {
  name: "Jack The Ripper",
  location: "London",
};

const shallowClone = obj => (Array.isArray(obj) ? [...obj] : { ...obj });
const changeLocation = obj => {
  obj.location = "Birmingham";
  return obj;
};
const result = pipe(shallowClone, changeLocation)(person);
console.log(person === result); // false

const result = pipe(changeLocation)(person);
console.log(person === result); // true
```

Another example would be finding word count in string.

```javascript
const log = val => console.log(val);
const text =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book";

const splitWords = val => val.split(" ");
const countWords = val => val.length;

pipe(splitWords, countWords, log)(text);
```

### Conclusion

It's been quite an adventure, we learned lots of new things, things that take time to digest. Such as currying to call the function multiple times with different arguments,
reduceRight right to reverse reduce, compose/pipe to compose functions as unaries, partially applying function so we can provide additional arguments on the fly. All these
concepts give us side-effect free(pure functions), immutable objects, testable and reusable functions. The examples we went through were quite trivial, but they can be used in complicated scenarios as well.
This is just the beginning of functional programming if you are into it check monads, transducers, functors.
