---
pubDatetime: 2021-12-03
title: Processing Massive Data Sets with Transducers in Javascript
slug: transducers-in-javascript
tags:
  - javascript
  - tutorial
  - functional_programming
description: In this article we`ll deep dive into transducers to optimize big data sets. Learn how to optimize compositions using Ramda and Javascript.
---

In programming, we love borrowing ideas from real life because we can make connections a lot easier if they resemble our day-to-day life. Now, stop here and think about concepts in programming such as objects, conditions, states.

For example, a computer can be represented as an object that consists of different properties like RAMs, GPU, CPU and maybe some other utilities like cables and fans.
We can easily define a pseudo computer in our program using an object.

```javascript
const computer = {
  GPU: "X",
  CPU: "Y",
  RAM: "4Gbs",
  fanCount: "4",
};
```

For example, a state in React will change if something internal or external happen.
In real life, if we go ahead and drink some water to quench our thirst need for water decreases and the so-called state changes.
Transducers do not fall far from the other examples. Transducers are devices to convert the energy of one kind into the energy of another kind, so for example, a microphone takes in sound waves and converts them into electrical signals to process.
In programming, transducers work as a reducer which reduces other reducers. If this feels ambiguous right now, bear with me, it will get a lot clearer as we move forward.

But, before we move on let's examine why we need transducers in the first place.

```javascript
const data = [
  {
    id: 1,
    name: "Alice's Adventures in Wonderland",
    completed: false
  },
  {
    id: 2,
    name: "The Fellowship of the Ring",
    completed: true
  },
  {
    id: 3,
    name: "The Return of the King",
    completed: false
  },
  .
  .
  .
  .
  .
  {
    id: 1000000,
    name: "1984",
    completed: true
  }
];
```

Now think about being have to iterate those items through various array methods.

```javascript
const oddIds = book => book.id % 1 === 0;
const completedBooks = book => book.completed;
const bookNames = book => book.name;

const completedBookNamesWithOddIds = data.filter(oddIds).filter(completedBooks).map(bookNames);
```

If those operations had to be applied over a small set of data such as 10, 100, 1000, it would not cause much trouble. But, if we had to deal with millions of data that would not be very appropriate.
Because each time we filter, map or reduce, we create intermediary arrays meaning, we are creating arrays with the length of 100k, 200k, and maybe 500k. By the way, transducers are not limited with arrays
we can apply transducers over arrays, trees, streams. So we can summarize transducers as:

- Optimized for big data sets
- Can be used with compose or pipe to compose functions in a efficent way
- Basically, big reducer that reduces other reducers

### Let's implement Transducer in Javascript

```javascript
const compose =
  (...fns) =>
  init =>
    fns.reduceRight((state, fn) => fn(state), init);

const bookName = book => book.name;
const marvelousBookName = book => ({ ...book, name: "Marvelous " + book.name });
const completedBook = book => book.completed;

const mapTransducer = fn => step => (acc, item) => step(acc, fn(item));

const filterTransducer = predicate => step => (acc, item) =>
  predicate(item) ? step(acc, item) : acc;

const completedBookNames = compose(
  filterTransducer(completedBook),
  mapTransducer(marvelousBookName),
  mapTransducer(bookName)
);
const arrayConcat = (a, c) => a.concat(c);

const xform = completedBookNames(arrayConcat);

const result = data.reduce(xform, []); //  ["The Fellowship of the Ring", "The Golden Compass", "1984"]
```

This is looking pretty scary to digest at the first sight, but after we went through it it will be a breeze. Okay, we start off with `mapTransducer`:

```javascript
const mapTransducer = fn => step => (acc, item) => step(acc, fn(item));
```

It accepts a callback function which is no different than regular map receving a callback function

```javascript
const numbers = [1, 2, 3, 4];
numbers.map(item => item * 2);
```

`fn` is actually `(item) => item * 2` here, and if you look closely we are calling fn with given item`fn(item)`.

Next we got `step`, step function is nothing but a accumulator function which sits at the top of function stack and accumulates mapped values into it.

Third one is just a placeholder for reducers callback. For example regular reducer accepts a similar callback function like this:

```javascript
const numbers = [1, 2, 3, 4];
numbers.reduce((acc, item) => item * 2);
```

And, finally we are accumulating our values into `step`:

```javascript
step    (     acc   ,     fn(item)     );
 |                        |
 |                        |
 |                        |
 ▼                        ▼
arrayConcat             bookName
```

The `filterTransducer` is just like `mapTransducer` but it first accepts predicate function - a function either true or false. Then proceeds just like a map transducer.
Now you might be asking yourself why we inverted the order of compose. Reason is transducer is actually a reducer which reduces other reducers. I know thats too many reducer in one sentence but bear with me.
If we decouple our transducer it will look like this:

```javascript
const bookNamesTransducer = mapTransducer(bookName);
const marvelousBookNameTransducer = mapTransducer(marvelousBookName);
const completedBookTransducer = filterTransducer(completedBook);

bookNamesTransducer(marvelousBookNameTransducer(completedBookTransducer));
```

Compose first calls bookName then marvelousBookName, and finally completedBook. But to apply marvelous and bookName it has to run predicate function once it's completed
it will then run marvelous and add 'Marvelous' to the beginning of book names then it will give us the book names. A transducer is a function that takes another transducer or a step function and returns a function that wraps it.
That is why we write them top-to-bottom or left-to-right so our changes can naturally propagate to the top step-by-step.

### Transducing with Ramda

Even though we managed to do it, writing a transducer from scratch is hard but not to worry. We have library called [Ramda](https://ramdajs.com/). This library provides us some handy utility functions
such as compose, when, transduce, map, filter, reduce. Now, we will try to achieve the same result using Ramda.

```javascript
import { compose, filter, map, transduce, into } from "ramda";

const bookName = book => book.name;
const marvelousBookName = book => ({
  ...book,
  name: "Marvelous " + book.name,
});
const completedBook = book => book.completed;

const xform = compose(filter(completedBook), map(marvelousBookName), map(bookName));
const arrayConcat = (a, c) => a.concat(c);

//With concat - step function
const completedMarvelousBooks = transduce(xform, arrayConcat, [], data);
//Without concat - step function
const completedMarvelousBooksV2 = into([], xform, data);
```

Most of the steps are pretty obvious; we have to replace our custom transducers functions with equivalents in Ramda because Ramda takes care of pretty much everything. Everything in Ramda is curried, so we don't have to worry about anything. The only distinction is, if you don't wanna bother with the accumulator function, which is in this context `arrayConcat`, you can ditch
Ramda's transduce and use into instead.

As we've discussed earlier, if we have to iterate big data sets, transducers might come in handy due to not having intermediary arrays at each step.

I hope we managed to peek behind the curtain because even though we can use battle-tested libraries like Ramda, it is crucial to understand how things work under the hood. Please, don't just skim read this; go ahead and try writing a transducer and then dabble around with Ramda to get familiar with it.
