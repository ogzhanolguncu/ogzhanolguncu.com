---
pubDatetime: 2020-11-02
title: Frequently Asked React and Front-end Interview Questions
slug: frequently-asked-react-and-frontend-interview-questions
featured: false
draft: false
tags:
  - tutorial
  - javascript
description: Today, we are going to discuss most frequently asked interview question that I faced during interviews.
---

It's been a long time since I write a blog post. Because of my day job I was quite occupied, tired and, because of my recent job searching
I wanted to write about the interview questions that I faced all the time. So, here we go.

## Table of Contents

1.  [Var vs Let vs Const](#var-vs-let-vs-const)
2.  [What Is Hoisting?](#what-is-hoisting)
3.  [What Is Closures?](#what-is-closures)
4.  [Most Commonly Used Functions Map, Filter, Find and Reduce](#most-commonly-used-functions-map-filter-find-and-reduce)
5.  [Optional Chaining](#optional-chaining)
6.  [Null Coalescing Operator vs Logical Operator](#null-coalescing-operator-vs-logical-operator) [Also Known As ?? vs ||](#null-coalescing-operator-vs-logical-operator)
7.  [Bind vs Arrow Function](#bind-vs-arrow-function)
8.  [What Is SPA](#what-is-spa)
9.  [SSR vs CSR](#ssr-vs-csr)
10. [Higher Order Functions and Components With Examples](#higher-order-functions-and-components-with-examples)
11. [React Lifecycle Methods](#react-lifecycle-methods)
12. [How To Access DOM Directly In React](#how-to-access-dom-directly-in-react)
13. [useMemo and useCallback](#usememo-and-usecallback)
14. [Context vs Redux](#context-vs-redux)
15. [Redux Flow](#redux-flow)
16. [Babel and Webpack](#babel-and-webpack)
17. [Async vs Promise](#async-vs-promise)

## Var vs Let vs Const

Actually, `var` and `let` is pretty similar only difference is `var` is function scoped and `let` is block scoped.
It can also be said `var` is more like a global variable whereas `let` is only valid inside its parent parenthesis.

By global I mean, because of the **hoisting** `var` can be accessed from the outer scope:

```javascript
if (true) {
  var a = 5;
}

console.log(a); // Prints out 5
```

But, if you try doing same example with `let` javascript will throw **_Uncaught ReferenceError: a is not defined_**

```javascript
if (true) {
  let a = 5;
}

console.log(a); // Prints out Uncaught ReferenceError: a is not defined.
```

The main reason we use `let` is to avoid [Hoisting](#what-is-hoisting) which I'll explain two minutes later in this post.
Finally, `const` is a **constant** value that cannot be changed once defined.
There are some exceptions which usually interviewers asks once you said you cannot change a `const` value once defined.
Such as what if I push a variable inside `const arr = []` array then what happens? It works since you don't **re-assign** the value.
There is one more trap question interviewer might ask what if I do this below code piece then what happens?

```javascript
const obj = {};
obj.someValue = "Does it work?";
```

Yeah, it works. It creates _key_ called `someValue` and _value_ called `Does it work?`. That's all you have to know about var, let and const.

## What Is Hoisting?

Before, `let` and `const` introduced people had to use `var` since there were no alternatives.
That caused a interesting problem called hoisting which is basically using variable before its definition. It's easier to show then write. Come along.

```javascript
// calling x after definition
var x = 5;
console.log(x, "\n");

// calling y after definition
let y = 10;
console.log(y, "\n");

// calling var z before definition will return undefined
console.log(z, "\n");
var z = 2;

// calling let a before definition will give error
console.log(a);
let a = 3;
```

You see, when `var` used javascript won't complain and returns **undefined** which is pretty annoying. But, when we use `let` javascript complains and says you cannot call a variable before definition and throws **Uncaught ReferenceError: Cannot access 'a' before initialization**

## What Is Closures?

Arghh, tough one. Interviewers loves closures, dunno why 😅. Let's get over it. [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures) document says

> A closure gives you access to an outer function’s scope from an inner function. In JavaScript, closures are created every time a function is created, at function creation time.

Closures are also like hoisting its a lot easier to show.

```javascript
function init() {
  var name = "Mozilla";
  function displayName() {
    // displayName() is the inner function, a closure
    name = "Chrome";
    console.log("Inner function --> ", name); // Returns Inner function --> Chrome
  }
  console.log("Outer function --> ", name); // Returns Outer function --> Mozilla
  displayName();
}
init();
```

As you can see we did not change the outer value. It only changes if we call `displayName()` closure.
That is a primitive way of emulating private values since JS doesn't have private class fields like other languages such as C#, Java and C++.
One practical use of closures may be [Debounce](#debounce) which I'll talk later.
Finally, be careful while using this technique may lead to memory leak and performance issues.

## Most Commonly Used Functions Map, Filter, Find and Reduce

### Map

The map is a functional way of iterating over elements. One of the important things to know that `map` is an **array method** and **returns a new array** after computation finishes.
Few use cases.

```javascript
const arr = [🍇, 🍈 , 🍉, 🍊];
arr.map(fruit => fruit) // Returns [🍇, 🍈 , 🍉, 🍊]

const arr = [2,4,5,6];
arr.map(number => number * number) // Returns [4,16,25,36]

```

By the way, if you don't need the returned array don't use `map` it's an anti-pattern use `forEach` instead since it does not return an array.

So, you shouldn't be using `map` if:

- you're not using the array it returns; and/or
- you're not returning a value from the callback.

### Filter

Like `map`, `filter` is an array method that takes conditions to filter out elements.

```javascript
const arr = [🍇, 🍈 , 🍉, 🍊,🍇,🍇];
arr.filter(fruit => fruit === 🍇) // Returns [🍇, 🍇 , 🍇]

//OR

arr.filter(fruit => fruit !== 🍇) // Returns [🍈 , 🍉, 🍊]
```

### Find

The `find` method returns the first element that satisfies the provided condition.

```javascript
const obj = [
  { name: "John", age: 18 },
  { name: "Ash", age: 19 },
  { name: "John", age: 20 },
];

obj.find(x => x.name === "John"); // Returns {name: "John", age: 18}
```

I intentionally left two **Johns** there to show that `find()` method returns the first element that satisfies the condition not the second one`{name: 'John', age: 20}`.

### Reduce

`reduce()` is extremely versatile method. You can do pretty much everything you can do with `map()`. I'll go over with some examples.

```javascript
const people = [
  { id: "1", name: "John", age: 18 },
  { id: "2", name: "Smith", age: 18 },
  { id: "3", name: "Ashy", age: 12 },
];

people.reduce((acc, person) => acc + person.age, 0); // Returns 48. Total age of people.

people.reduce((acc, person) => {
  if (acc !== null) return acc;
  if (person.name === "John") return person;
  return null;
}, null);

people.reduce((acc, person) => {
  if (person.age > 25) {
    acc = [...acc, person];
  }
  return acc;
}, []);
```

As you can see, our first `reducer` returned `48`, second one returned `{id: "1", name: "John", age: 18}` and third one returned `**[{id: "1", name: "John", age: 18}, {id: "2", name: "Smith", age: 35}]**`.
If I have to explain how it works `reduce` works like a `recursive function`.
The first parameter behaves as an accumulator basically holds our total value.
So, each time reducer works it iterates over person ages and adds them to accumulator then finally returns the sum of the total.

That was how the first reducer works.The second one is pretty straight forward, its a `find()` method implemented in the reducer. Looks for `John` in peoples array when it finds `John` return associated object.
The third `reducers` works similar to `filter()` method it actually `filter()` implemented in `reduce`. It iterates over peoples array and looks for person who's age greater than 25.

## Optional Chaining

Long before **optional chaining** added to Ecmascript, we had to do lots of hacky stuff to ensure data is not undefined. Things like this **person && person.car && person.car.wheels** if `person.car` is undefined and you have not used `&&` then you are screwed,
because Javascript will throw **Uncaught TypeError: Cannot read property 'name' of undefined**. This piece of code will ruin your life in runtime 😅. So, instead people came up with something like that to prevent **undefined errors**

```javascript
const adventurer = {
  name: "Alice",
  cat: {
    name: "Dinah",
  },
};

const dogName = adventurer.dog?.name;
console.log(dogName);
```

Javascript will not complain about this and simply return `undefined` and you are good to go.

## Null Coalescing Operator vs Logical Operator

First, let me tell you what `||` and `??` those are. The first one is **Logical Or** and the second one is **Nullish coalescing operator**. Let's go over first one with examples.

```javascript
console.log(false || "Hello"); //Returns Hello
console.log(undefined || "Hello"); //Returns Hello
console.log(null || "Hello"); //Returns Hello
console.log(0 || "Hello"); //Returns Hello
```

All of those will return `Hello`, because **Logical Or** first evaluates left side of the operation, if its **_true_** then returns left side if its not returns right side.

```javascript
console.log(false ?? "Hello"); //Returns false
console.log(undefined ?? "Hello"); //Returns Hello
console.log(null ?? "Hello"); //Returns Hello
console.log(0 ?? "Hello"); //Returns 0
```

This one is a bit tricky, due to **Nullish coalescing operator**'s nature, if left side of the operation is either **_false_** or **_0_** it will return left side but if it is **_null_** or **_undefined_** then it will return `Hello`.

## Bind vs Arrow Function

### Binding

```javascript
import React from "react";
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.clickHandler = this.clickHandler.bind(this);
  }

  clickHandler() {
    console.log(this);
  }

  render() {
    return <button onClick={this.clickHandler}>Click Me</button>;
  }
}
```

### Arrow Function

```javascript
import React from "react";
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  clickHandler = () => {
    console.log(this);
  };

  render() {
    return <button onClick={this.clickHandler}>Click Me</button>;
  }
}
```

They pretty much similar apart from their syntax. People used **_Binding_** before **_Arrow Functions_** included in ES6. So, tell your interviewer that if s/he want to avoid **code smells** s/he should be using arrow functions, because
its way more readable and understandable.

## What Is SPA

> A single-page application (SPA) is a web application or website that interacts with the user by dynamically rewriting the current web page with new data from the web server, instead of the default method of the browser loading entire new pages. The goal is faster transitions that make the website feel more like a native app.
> [Wikipedia](https://en.wikipedia.org/wiki/Single-page_application)

This is a general definition, but let me tell you how thi works in React.

```javascript
ReactDOM.render(<App />, document.getElementById("root"));
```

If you have no idea about React, this `<App />` piece of code actually stands as gateway to our React app. All the components you make will reside in `<App />`.
And, this component will be getting rendered in `<div id="root"></div>` this div.
So, whenever React gets rerendered you are actually still in the same page but only requested parts of the app changes.
Also, if you check out the url of your browser it also stays same, because you never left the page.

## SSR vs CSR

SSR stands for _*Server Side Rendering*_, which means all your **code**, first get prepared on the server side then send fully rendered page to the client.

_Benefits of Server Side Rendering_

- Improved SEO
- Improved Page Speed

CSR stands for _*Client Side Rendering*_. The server sends a single page without a content, then browser starts rendering components as you fetch Javascript.
The downside of the CSR is; Browser shows you a blank page which impacts SEO because of [First Paint](https://web.dev/user-centric-performance-metrics/#first_paint_and_first_contentful_paint) (FP) and [First Contentful Paint](https://web.dev/user-centric-performance-metrics/#first_paint_and_first_contentful_paint) (FCP) kinda slow.

_Benefits of Client Side Rendering_

- Easy Deployment
- Cheap Hosting
- Less Server Side Workload

## Higher Order Functions and Components With Examples

Higher-order functions are functions that take other functions as arguments or return functions as their results.
As you can imagine, Higher-order components aka **_HOC_** also take other components as arguments and return a new altered component.

### Higher Order Functions

Actually, you already knew and used higher order functions. Some of the basic higher order functions we use:

- Filter
- Map
- Reduce

These are higher order functions built into Javascript.

Example:

```javascript
const people = [
  { name: "John", age: 35, gender: "M" },
  { name: "Doe", grade: 28, gender: "M" },
  { name: "Sarah", grade: 21, gender: "F" },
];

const isMale = people => people.gender === "M";
const isFemale = people => people.gender === "F";
const getMales = people => people.filter(isMale); // Filter takes an another function as an argument.

console.log(getMales(people));
```

### Higher Order Components

If you've ever implemented **Authentication** in React, you probably know what **_HOC_** is.

Example:

```jsx
export function AuthHOC(Component) {
  return class AuthenticatedComponent extends React.Component {
    isAuthenticated() {
      return this.props.isAuthenticated;
    }

    render() {
      const loginErrorMessage = (
        <div>
          Please <a href="/login">login</a> in order to view this part of the application.
        </div>
      );

      return (
        <div>
          {this.isAuthenticated === true ? <Component {...this.props} /> : loginErrorMessage}
        </div>
      );
    }
  };
}

export default AuthHOC;
```

And this is how you use it:

```jsx
import React from "react";
import { AuthHOC } from "./AuthenticatedComponent";

export class MyPrivateComponent extends React.Component {
  render() {
    return <div>My secret search, that is only viewable by authenticated users.</div>;
  }
}

// Now wrap MyPrivateComponent with the AuthHOC function
export default AuthHOC(MyPrivateComponent);
```

The primary goals of **_HOC_**:

- [**Don't Repeat Yourself**](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)
- [**Do One Thing and Do It Well**](https://en.wikipedia.org/wiki/Unix_philosophy)
- [**Separation of Concerns**](https://en.wikipedia.org/wiki/Separation_of_concerns)

## React Lifecycle Methods

Each component in React has a lifecycle which you can manipulate through methods.
First, I wanna talk about class component lifecycle methods, then I'll explain in functional components respectively.

### Class Component Lifecycles

![lifecycle-methods](/blog-images/frequently-asked-react-and-frontend-interview-questions/lifecycles.png)

As you can see, there are some commonly used lifecycle methods.

- constructor: The `constructor()` method is called before anything else, and this usually where you set your `state`.
- render: The `render()` method is required to show your outputs to end-user.
- componentDidMount: The `componentDidMount()` method is called after your component fully rendered.
- componentDidUpdate: The `componentDidUpdate()` method is called after your component is updated in the DOM.
- componentWillUnmount: The `componentWillUnmount()` method is called right before you left the component. This is usually where you clean-up your listeners.

Example:

```jsx
import React from "react";
import ReactDOM from "react-dom";

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = { favoritecolor: "red" };
  }
  componentDidMount() {
    setTimeout(() => {
      this.setState({ favoritecolor: "yellow" });
    }, 1000);
  }
  componentWillUnmount() {
    setTimeout(() => {
      console.log("I will unmount");
    }, 1000);
  }
  render() {
    return <h1>My Favorite Color is {this.state.favoritecolor}</h1>;
  }
}

ReactDOM.render(<Header />, document.getElementById("container"));
```

### Functional Component Lifecycles

Thanks to [React Hooks](https://reactjs.org/docs/hooks-intro.html), people find a better way to utilize lifecycle methods.
Some of the common methods we discussed at the top, gathered in one method, and this is `useEffect()`. `useEffect()` replaces three method.

- componentDidMount
- componentDidUpdate
- componentWillUnmount

I'll explain this with examples:

```jsx
import React, { useEffect, useState } from "react";
import "./styles.css";

export default function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("I'm getting rendered yeyyyyy");
    FakeAPI.subscribeToFriendStatus(id, handleStatusChange);
    return () => {
      FakeAPI.unsubscribeFromFriendStatus(id, handleStatusChange);
    };
  }, [count]); // Only re-run the effect if count changes

  useEffect(() => {});

  return (
    <div className="App">
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(prevState => prevState + 1)}>Click me!</button>
    </div>
  );
}
```

In this example, component will first render `I'm getting rendered yeyyyyy` no matter what, then it'll only render, if you click on **Click me!**.
And, finally in `return () => {}` it will clean-up your listeners similar to `componentWillUnmount()`.

## How To Access DOM Directly In React

You can access DOM directly specifying the `ref`.

#### When to Use Refs

- Managing focus, text selection, or media playback.
- Triggering imperative animations.
- Integrating with third-party DOM libraries.

Example:

```jsx
function CustomTextInput(props) {
  // textInput must be declared here so the ref can refer to it
  const textInput = useRef(null);

  function handleClick() {
    textInput.current.focus();
  }

  return (
    <div>
      <input type="text" ref={textInput} />
      <input type="button" value="Focus the text input" onClick={handleClick} />
    </div>
  );
}
```

## useMemo and useCallback

These are broad topics that cannot be summarized in few words, but there are some key things to remember.
If interviewers asks you how to eliminate unncessary render in React
tell them to use `useMemo()` at component level and `useCallback()` at function level.
These functions utilizes concept called **memoization**, which basically having a copy of old versions of objects, and using them if the data has not been changed.

> For more information please, check Kent's article about useMemo and useCallback [When to useMemo and useCallback](https://kentcdodds.com/blog/usememo-and-usecallback).

## Context vs Redux

They both being used for global state management, and there is one important distinction, **Context** is built into React and can be used through `useContext()`.
On the other hand **Redux** is popular statement management library favored by lots of developer. Oppose to Context, Redux might be overkill for your project depending on your needs.

## Redux Flow

![Redux-Flow](/blog-images/frequently-asked-react-and-frontend-interview-questions/redux-flow.gif)

This beautiful GIF taken from --> [Redux Data Flow](https://github.com/reduxjs/redux/issues/653).

To simply put,

- When event triggered from UI it dispatchs an action, which carries a payload and type
- Then in reducer, the dispatched function gets resolved according to its relevant action type, which ultimately returns a new state.
- Then the store notifies the view.
- And, finally view gets re-rendered with final state.

## Babel and Webpack

**Babel** allows you to use latest ES features without worrying about browser compatibility. Turns your ES6+ code into this:

```javascript
// Babel Input: ES2015 arrow function
[1, 2, 3].map(n => n + 1);

// Babel Output: ES5 equivalent
[1, 2, 3].map(function (n) {
  return n + 1;
});
```

**Webpack** allows you to bundle all your assets into one or more bundles.

- Does tree shaking which eliminates unncessary codes.
- Improves file sizes.
- More control over assets.

## Async vs Promise

These are actually pretty similar concepts, but difference lies in their syntaxes. `Async/Await` is basically a syntactic sugar.

### Promise

```javascript
function promiseFunc(string) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(string);
    }, 1000);
  });
}
promiseFunc("hello").then(response => console.log(response));
```

### Async/Await

```javascript
function promiseFunc(string) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(string);
    }, 1000);
  });
}

async function doIt() {
  const myPromise = await promiseFunc("hello");
  console.log(myPromise); // "hello"
}

doIt();
```

Pretty much the same stuff, but `Async/Await` lets you write cleaner, maintainable and understandable functions.
