---
pubDatetime: 2020-10-23
title: Binary Search In Javascript
slug: binary-search-in-javascript
featured: false
draft: false
tags:
  - javascript
  - tutorial
  - computerscience
description: Learn how to perform a binary search in Javascript and talk a little about O notation.
---

Today, we are going to learn how to perform a binary search in Javascript and talk a little about [O notation](https://en.wikipedia.org/wiki/Big_O_notation). First off, what is the binary search? **Binary search** is actually searching through an already sorted array with minimum iterations. So, the difference between binary and linear search, where we just try to find the desired value by going through each element is binary search cuts down your search to half as soon as you find the middle element. The worst complexity case of linear search is **O(n)**, where the binary search is making **O(log n)** comparison, meaning time goes up linearly where <code>n</code> goes up exponentially. So, if it takes 1 second to compute 10 elements, it will take 2 seconds to compute 100 elements, 3 seconds to compute 1000 elements, and so on.

Let's dive into the code.

```javascript
const linearSearch = (val, arr) => {
  let iterationCounter = 0;
  for (let i = 0; i < arr.length; i++) {
    iterationCounter++;
    if (val === arr[i]) {
      return [arr[i], iterationCounter];
    }
  }
};
const arrayOfNumber = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const result = linearSearch(7, arrayOfNumber); // --> Result is: [8, 9]
```

Function takes two parameters one for searched value and one for source. If, item we are looking for matches, it returns elements index. First return value indicates elements index and second indicates iteration count. So, we iterated our array **9 times** to find our values index. Now, let's try binary search.

```javascript
const binarySearch = (val, arr) => {
  let lower = 0;
  let upper = arr.length - 1; // Last element of the array
  let iterationCounter = 0;

  while (lower <= upper) {
    iterationCounter++;
    const middle = lower + Math.floor((upper - lower) / 2);
    if (val === arr[middle]) return [middle, iterationCounter];
    if (val < arr[middle]) {
      upper = middle - 1;
    } else {
      lower = middle + 1;
    }
  }
};
const arrayOfNumber = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const result = binarySearch(8, arrayOfNumber); // --> Result is: [8, 3]
```

First, we define upper and lower limits and then in order to find the middle value we add first and last value then divide it by two. But in case of even length we round it to floor. At the beginning, we talked about binary search is some sort of divide and conquer algorithm. To visualize this let's take a look at this piece of code.

```javascript
//Search for 8
[0,1,2,3,4,5,6,7,8,9] --> Middle: 4 (Rounds to lower)
[5,6,7,8,9] --> Middle: 7
[8,9] ---> Since value equals middle which is: 8
```

As you can see we find the same value doing a lot fewer iterations. Now, you may ask why do I use binary search, right? I'm going to answer this question using [Scott Berry's](https://www.quora.com/profile/Scott-Berry-1) answer in Quora: "_So, say you have an alphabetical list of 1000 names. You could go one at a time looking for the name you want, for an average of 500 comparisons. Or you could keep track of the highest and lowest ones, and compare the "middle" one with what you're looking for, which will take somewhere around 20 comparisons. For 1,000,000 names, it's a clearer win. You could go through in order, for an average of 500,000 comparisons. Or you could use a binary search for somewhere around 40._"

#### Complexity Comparison

Best case for Binary Search is O(1), where the target value is the middle element of the array Worst
and average for Binary Search is O(Log n)

Best case for Linear Search is O(1), where the target value is the first element of the array
Worst and average for Binary Search is O(n)
