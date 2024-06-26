---
pubDatetime: 2020-10-23
title: Selection Sort In Javascript
slug: selection-sort-in-javascript
tags:
  - javascript
  - tutorial
  - computerscience
description: Today, we are going to discover how Selection Sort works and discuss its complexity using Big O Notat... Tagged with javascript, datastructures, computerscience, typescript.
---

Today, we are going to discover how **Selection Sort** works and discuss its complexity using [Big O Notation](https://en.wikipedia.org/wiki/Big_O_notation). Selection sort may not be one of the fastest, but one of the easiest sort to write down.

```javascript
    Modern Times --  8.5
    The Godfather: Part II --	9.0
    The Shawshank Redemption -- 9.2
    The Silence of the Lambs -- 8.6
    Twelve Angry Men -- 8.9
```

Now, let's suppose you want to sort movie ratings in IMDB, from most to least. How would you do it?

```javascript



    Modern Times --  8.5                           The Shawshank Redemption -- 	9.2
    The Godfather: Part II --	9.0          --->
    The Shawshank Redemption -- 	9.2
    The Silence of the Lambs -- 8.6
    Twelve Angry Men -- 8.9

    Modern Times --  8.5                           The Shawshank Redemption -- 	9.2
    The Godfather: Part II --	9.0          --->    The Godfather: Part II --	9.0
    /*DELETED*/
    The Silence of the Lambs -- 8.6
    Twelve Angry Men -- 8.9

    Modern Times --  8.5                           The Shawshank Redemption -- 	9.2
    /*DELETED*/                             --->   The Godfather: Part II --	9.0
    /*DELETED*/                                    Twelve Angry Men -- 8.9
    The Silence of the Lambs -- 8.6
    Twelve Angry Men -- 8.9
```

So, it's time to talk about its complexity. Each time we look for an element cost us **O(n)** but, since we have to do this operation for each element, we need to do it n times which costs us **O(n x n)** meaning **O(n<sup>2</sup>)**

#### Code

```javascript
const findSmallest = arr => {
  let smallest = arr[0];
  let smallestIndex = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < smallest) {
      smallest = arr[i];
      smallestIndex = i;
    }
  }
  return smallestIndex;
};
```

First, we need to find the smallest or highest to sort. To do that, we write this simple function, that takes an array as an argument and chooses the first element as its pivot, then iterates over an array. If any element is smaller than our **smallest** we swap the values. Finally, when we're done, we return the value.

```javascript
const selectionSort = arr => {
  const newArray = []
  const arrayLength = arr.length
  for(let i = 0; i < arrayLength; i++)
    newArray.push(...arr.splice(findSmallest(arr),1)) // Removing smallest from the array
  return newArray                                     // and destructring it since splice returns an array.
                                                      // then pushing it into our sorted array.
}
selectionSort([10,2,99,6,1,7]) --> Returns: 1,2,6,7,10,99
```

This function makes use of our <code>findSmallest()</code>. Whenever we find the smallest value, we push it to our <code>newArray</code> and delete from the existing one. Three dots used for destructuring since splice returns an array. By the way, <code>splice()</code> manipulates original array and returns desired output.
