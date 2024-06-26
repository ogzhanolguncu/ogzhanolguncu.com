---
pubDatetime: 2020-10-23
title: Quicksort In Javascript
slug: quicksort-in-javascript
tags:
  - javascript
  - tutorial
  - computerscience
description: Have you ever wondered why Quicksort called quick? Because it's one of the fastest sorting algorithms out there. Tutorial in Javascript/Typescript.
---

Have you ever wondered why Quicksort called quick? Because it's one of the fastest sorting algorithms out there. By the way, that's not why it's called quick. Yet, it's still faster than a bubble, insertion and selection sort and it works fast pretty much in all cases. In the average case, quicksort has **Θ(n log(n))** complexity, at worst **Θ(n<sup>2</sup>)**. When the problem is divided into little chunks and those chunks recursively divided into more chunks and more and more. This is can be perceived as a **Θ(n log(n))** complexity. Check the below to solidify this information.

```javascript
                                   xn
                            xn/2         xn/2
                              |            |
                              |            |
                              ˅            ˅
                        xn/4   xn/4   xn/4   xn/4
                           |     |     |      |
                           |     |     |      |
                           ˅     ˅     ˅      ˅
                           x     x     x      x
```

Since we get past the boring part we can start typing our first example.

```javascript
[1, 3, 2][1], // First, we need a pivot so we choose the first element as pivot. If any element greater than pivot goes right if smaller goes left.
  [3, 2][(1, 2)], // We now have 1 on the left so need to sort one more time. This time we pick 3 as a pivot. Since 2 is lower than 3 we push it 2 left we end up having
  [3][(1, 2, 3)]; // Then we concat those array into this
```

Let's see it in action.

### Code

```javascript
function quickSort(arr) {
  if (arr.length < 2) return arr;
  const pivot = arr.shift(); // Shift() mutates original array and return first element. Opposite of pop()
  const leftOfPivot = [];
  const rightOfPivot = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] <= pivot) leftOfPivot.push(arr[i]);
    else rightOfPivot.push(arr[i]);
  }
  return [...quickSort(leftOfPivot), pivot, ...quickSort(rightOfPivot)];
}
```

This might seem scary at first, but belive me it's not. We make use of recursive function and destructuring. Whenever you write recursive function, always define a base case first which in our case is, if array has less than two elements it means array has only one element and doesn't need sorting, we just return the <code>arr</code>. If array size bigger than 2, we first pick pivot using <code>shift()</code> which deletes first element from original array and returns it.

Then, we need two arrays to store bigger and smaller elements that sorted against pivot.

Then, we iterate our original array. If, item in the original array smaller than pivot push it to <code>leftOfPivot[]</code>if it's not push it to <code>rightOfPivot[]</code>.

Here comes the crucial part. We use <code>...</code> to destructure and call our<code>quickSort()</code> with that <code>leftOfPivot[]</code> and <code>rightOfPivot[]</code> array to repeat all this process. All these individual recursions will keep running until their array size is smaller than 2. Each recursion will finally yield it's own sorted array.
