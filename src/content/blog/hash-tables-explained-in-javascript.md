---
pubDatetime: 2020-10-23
title: Hash tables explained in Javascript
slug: hash-tables-explained-in-javascript
tags:
  - javascript
  - computerscience
  - tutorial
description: Hash tables are incredibly powerful and versatile beasts. They let you store your data in a key-value
---

Hash tables are incredibly powerful and versatile beasts. They let you store your data in a key-value format similar to the plain Javascript object. But for a hash table to be effective it should have unique keys. You might think this as a phone book, each name corresponds to a phone number, so you know exactly where to look.

```javascript
Adam-- > +3435232323;
Ben-- > +2323231313;
Cambell-- > +4566464534;
```

If you type **Adam** in your phone it immediately returns **+3435232323** with zero down-time. Because the hash table search has <code>O(1)</code> complexity just like delete and insertion.

Another example of this might be storing movies in alphabetical order. As you can imagine two different movie names might start with the same letter. So, you also need to run through these movies until finding the right one. Let's suppose we are looking for **The Abyss**.

```javascript
A
B
C
.
.
.

T ---> The Lord of the Rings
       The Godfather
       The Abyss  // Found it.
```

It first ran through alphabetically then ran through movies to find the right one.

But If you have two **Adam** on your phone with different phone numbers or two **The Abyss** on your movie list, now you got **collision** problem, meaning two keys are identical. This should be avoided in all cases.

The reason behind unique keys are to decrease time of our <code>get()</code>, <code>set()</code>, <code>delete()</code> and avoid collision. Let's implement unique table using [Map](https://developer.mozilla.org/tr/docs/Web/JavaScript/Reference/Global_Objects/Map).

```javascript
const hashTable = new Map([
  ["Adam", +12345],
  ["Ben", +12346],
  ["Cambell ", +123457],
]);
hashTable.get("Cambell"); // +123457

hashTable.delete("Cambell")[(["Adam", +12345], ["Ben", +12346])]; // Deletes Cambell from list

hashTable.set("Cambell", +123457)[(["Adam", +12345], ["Ben", +12346], ["Cambell ", +123457])]; // Adds Cambell to list
```

To prevent **collision** `Map` has useful method called `has()` which retuns true if `Map` has the searched element. I advise you to use `has()` before setting up new values to avoid collision.

```javascript
const hashTable = new Map([
  ["Adam", +12345],
  ["Ben", +12346],
  ["Cambell ", +123457],
]);
hashTable.has("Cambell"); // true
```

To override one of the values you can use `set()` again.

```javascript
const hashTable = new Map([
  ["Adam", +12345],
  ["Ben", +12346],
  ["Cambell ", +123457],
]);
hashTable.set("Cambell", +12345678)[(["Adam", +12345], ["Ben", +12346], ["Cambell ", +12345678])];
```

Now let's suppose you've saved **Adam-1** and **Adam-2** under name **Adam**. Usually this operation takes `O(n)` because you need to iterate over **Adam** array, but in our case we are using `Map` this means `get()` operation has constant time with `O(1)` complexity. It's little tricky to work with it, but let's see.

```javascript
const hashTable = new Map([
  [
    "Adam",
    [
      ["Adam-1", +1234],
      ["Adam-2", +1235],
    ],
  ],
  ["Ben", +12346],
  ["Cambell", +123457],
]);
new Map(hashTable.get("Adam")).get("Adam-2"); // +1234
```

First, we use `get()` as usual then create new `Map` from returned value, now we can again use `get()` for nested children.
