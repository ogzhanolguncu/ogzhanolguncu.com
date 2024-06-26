---
pubDatetime: 2020-10-23
title: Currying in Javascript with examples
slug: using-curry-the-functional-way
tags:
  - javascript
  - tutorial
  - computerscience
description: Currying is actually a process of linking functions together to reduce the number of arguments they take by utilizing lambda calculus.javascript, typescript, tutorial, functional.
---

### Prerequisites

**Knowledge of higher order functions and arrow functions are needed.**

Name curry doesn't come from the spice we know, it comes from [Haskell Curry ](Haskell Curry) a mathematician. Haskel Curry defines Currying as:

> "Currying is the technique of translating the evaluation of a function that takes multiple arguments into evaluating a sequence of functions, each with a single argument".

Currying is actually a process of linking functions together to reduce the number of arguments they take by utilizing lambda calculus. This technique gives us an option to control how arguments are passed to functions. Enough chit chat let's see the code!

## Regular Function

```javascript
function addNumber(x) {
  return function (y) {
    return function (z) {
      return x + y + z;
    };
  };
}

const add5 = addNumber(5);

const add10 = add5(10);

const add15 = add10(15);
console.log("Returns 30", add15);
```

At first sight, this may look like functions inside the function but it's more than that. Each function has it's own scope so you can do whatever you want and not worry about changing the outer variables. Please, see [Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures) for more detail. First, when we invoke <code>addNumber</code> it returns **<code>[Function]</code>** because there are still two more function waiting to be executed. Also, **secondFunction** returns **<code>[Function]</code>** because function is still not resolved. But, when we call the function one last time it returns 30 because all the functions finally evaluated.

I know what you are thinking right now. Saying things like "Why do I wanna define three variables just to get function result?". What if said there is an easier way to curry?

```javascript
function addNumber(x) {
  return function (y) {
    return function (z) {
      return x + y + z;
    };
  };
}

addNumber(5)(10)(15); // Returns 30
```

Ta-da. See? A lot cleaner and easier to read. Stay tight we are not done yet.
We can do these similar actions using [Arrow Function](https://developer.mozilla.org/tr/docs/Web/JavaScript/Reference/Functions/Arrow_functions).

```javascript
const randomNumbers = [4, 6, 2, 3];

const mapFilterGivenArray = x => y => z => d =>
  x
    .map(item => item * y)
    .filter(number => !(number % z))
    .reduce((prev, current) => prev + current, d);

mapFilterGivenArray(randomNumbers)(2)(3)(4); // Returns 22
```

Here, we're mapping -> filtering -> reducing <code>randomNumbers</code> array. Parameter **X** takes <code>randomNumbers</code> array, **Y** takes a value to map over the array with a given value which is **2** and returns a mapped version of <code>randomNumbers</code>, **Z** filters out numbers only dividable by given number, in that case, **3** and finally, **D** takes an initial starting value **4**.

We're not done yet. What if you wanted to **Un-curry** the parameters? It's really easy. Check this out.

```javascript
const randomNumbers = [4, 6, 2, 3];

const mapFilterGivenArray = x => y => z => d =>
  x
    .map(item => item * y)
    .filter(number => !(number % z))
    .reduce((prev, current) => prev + current, d);

const unCurry = (x, y, z, d) => mapFilterGivenArray(x)(y)(z)(d);
unCurry(randomNumbers, 2, 3, 4); // Returns 22
```

Similar to destructuring, you specify the parameters you want.

One more, this is called **Partial Application**.

```javascript
const randomNumbers = [4, 6, 2, 3];

const mapFilterGivenArray = x => y => z => d =>
  x
    .map(item => item * y)
    .filter(number => !(number % z))
    .reduce((prev, current) => prev + current, d);

const partialCurry = d => mapFilterGivenArray(randomNumbers)(2)(3)(d);
partialCurry(4); // Returns 22
```

Reducing your function to fewer parameters called partial application.

### Final Thoughts

To be honest, I've never used curry functions except for coding challenges but it's good to know how functional programming works.
