---
pubDatetime: 2021-03-06
title: Must Know Types in Typescript
slug: must-know-types-in-typescript
tags:
  - typescript
description: In this article we will talk about types we use in our everyday lives to ease development process. And, discover some tricks that can be used with Typescript types.
---

Types are the number one reason why we use Typescript in the first place and there are lots them we can benefit from. As a Frontend developer specialized in React,
there some trick that I utilize to make everything seamlessly work with types. With these tips and tricks Typescript will become a breeze instead of a burden to carry.

## Table of Contents

## Type Aliases

There are several way to define a `Type` in Typescript:

```typescript
// Defining a type
type Person = {
  age?: number; // Optional property
  name: string;
  id: ID;
};

// Defining union type
type ID = number | string;

// Combining types
type Person = {
  age: number;
  name: string;
  id: ID;
};

type Car = {
  color: string;
  year: number;
};

type CarAndPersonCombined = Person & Car;
```

## Object Type

If type is not a complex one and easy to write, we simply:

```typescript
// Directly inside parameter
const foo = (id: { id: string | number }, car: { color: string; year: number }) => {};
```

## Record Type

A `Record<K, T>` is an object type whose property keys are K and whose property values are T. So, we make sure Records key type, and, of course, property types won't be something we did not anticipate..

```typescript
const colorMap: Record<string, { color: string; hover: string }> = {
  nextjs: { color: "#0A7B83E2", hover: "#09686dE2" },
  javascript: { color: "#F5B50FE2", hover: "#d69e0cE2" },
};
```

The example above tells us keys will always be `string`, `color` and `hover` properties will be string as well. If we try to supply them with a `number`, we'll receive an error below.

```typescript
const colorMap: Record<string, { color: string; hover: string }> = {
  nextjs: { color: 1234, hover: 1245 }, // Type 'number' is not assignable to type 'string'.ts
  javascript: { color: "#F5B50FE2", hover: "#d69e0cE2" },
};
```

So if we are aiming for full control over key and property types `Record`'s are way to go.

## Omit Type

If you already have a type but want to delete some properties? `Omit` can make this happen.

```typescript
type Person = {
  name: string;
  age: number;
  salary: number;
};

type PersonWithoutSalary = Omit<Person, "salary", "age">;

const personObj: PersonWithoutSalary = {
  name: "Foo",
};
```

We've deleted `salary` and `age` from `Person` type now all we have is `name`.

## Pick Type

So you want to `Pick` properties instead of omitting things you don't want to have?

```typescript
type Person = {
  name: string;
  age: number;
  salary: number;
};

type PersonWithoutSalary = Pick<Person, "salary">;

const personObj: PersonWithoutSalary = {
  salary: 10000,
  age: 19, // Type '{ age: number; }' is not assignable to type 'Pick<Person, "salary">'
};
```

If you try to use a property that is not included in `Pick`, Typescript will throw an error.

## Union Type

```typescript
type TodoProps = {
  id: string;
  desc: string;
  state: StateTypes;
};

type StateTypes = "Active" | "All" | "Completed";
```

A to-do state is a perfect example of the `Union` type. If all you need is one out of a list of conditions, then we utilize `Union`. By doing that
we restrict other options and make IntelliSense work in our favour.

## Typeof Type

If you are so lazy to create a new type, and you already have an object to map out your types:

```typescript
const Person = {
  name: "John",
  age: "20",
};

type PersonType = typeof Person;

const newPersonObj: PersonType = {
  name: "Smith",
  age: "21",
};
```
