---
pubDatetime: 2023-07-19
title: Write Your Own JSON Parser with Node and Typescript
slug: write-your-own-json-parser
tags:
  - typescript
  - nodejs
description: Let's write our very own JSON Parser from scratch
---

JSON parsers are everywhere in today's development landscape. For example, even in VS Code, a JSON parser is built-in. You can test this by copying and pasting a valid or invalid JSON into a new file in VS Code. It will immediately pick up the file, parse it, and highlight any errors. Go ahead, try it out!

Now, let's delve into some key concepts we need to understand before diving into the code.

## Lexical Analysis a.k.a Tokenizing

Tokenizing is always the first step when writing your own interpreter or compiler. Even your favorite prettifiers tokenize the entire file before prettifying it. Tokenizing involves breaking the code or input into smaller, understandable parts. This is essential because it allows the parser to determine where to start and stop during the parsing process.

Tokenizing helps us understand the structure of the code or input being processed. By breaking it down into tokens, such as keywords, symbols, and literals, we gain insight into the underlying components. Additionally, tokenizing plays a crucial role in error handling. By identifying and categorizing tokens, we can detect and handle syntax errors more effectively.

In the upcoming sections of this blog post, we will dive deeper into the process of tokenizing. We will provide a step-by-step guide on how to implement tokenizing in your own JSON parser. So, let's get started!

Let's imagine we have a JSON like this:

```json
{
  "id": "647ceaf3657eade56f8224eb",
  "index": 0,
  "something": [],
  "boolean": true,
  "nullValue": null
}
```

For example:

- Opening brace
- Then, string key "id"
- Then, a colon
- Then, string value "647ceaf3657eade56f8224eb"
- Open bracket and close bracket
- Boolean value and null value

If we had to come up with a Type for this in TypeScript, it would be something similar to this:

```ts
export type TokenType =
  | "BraceOpen"
  | "BraceClose"
  | "BracketOpen"
  | "BracketClose"
  | "String"
  | "Number"
  | "Comma"
  | "Colon"
  | "True"
  | "False"
  | "Null";

//And a token object would look like this

export interface Token {
  type: TokenType;
  value: string;
}
```

Does it make sense? Now let's manually convert this into an array of tokens before we write the actual tokenizer, to see how it will look in the end. This way, we can better understand the process step by step.

```ts
[
  { type: "BraceOpen", value: "{" },
  { type: "String", value: "id" },
  { type: "Colon", value: ":" },
  { type: "String", value: "647ceaf3657eade56f8224eb" },
  { type: "Comma", value: "," },
  { type: "String", value: "index" },
  { type: "Colon", value: ":" },
  { type: "Number", value: "0" },
  { type: "Comma", value: "," },
  { type: "String", value: "something" },
  { type: "Colon", value: ":" },
  { type: "BracketOpen", value: "[" },
  { type: "BracketClose", value: "]" },
  { type: "Comma", value: "," },
  { type: "String", value: "boolean" },
  { type: "Colon", value: ":" },
  { type: "True", value: "true" },
  { type: "Comma", value: "," },
  { type: "String", value: "nullValue" },
  { type: "Colon", value: ":" },
  { type: "Null", value: "null" },
  { type: "BraceClose", value: "}" },
];
```

When the tokenizer finishes tokenizing, we want to end up with the array of tokens we manually created earlier.

Let's take the first step and write our initial code. Assuming you have already set up a Node.js and TypeScript development environment for yourself, create an entry file called main.ts within the same directory. Additionally, let's create a file called types.ts and place the token type definitions inside it.

```ts
export type TokenType =
  | "BraceOpen"
  | "BraceClose"
  | "BracketOpen"
  | "BracketClose"
  | "String"
  | "Number"
  | "Comma"
  | "Colon"
  | "True"
  | "False"
  | "Null";

export interface Token {
  type: TokenType;
  value: string;
}
```

Now, go ahead and create another file called `tokenizer.ts`.

```ts
//tokenizer.ts
import { Token } from "./types.js";

export const tokenizer = (input: string): Token[] => {
  return [];
};
```

Alright, let's think about how we can go through the JSON string to get our tokens.

One way to do it is by using a variable to track our current position in the JSON string. We'll keep increasing its value until we cover the entire string length.

By doing this, we'll be able to process each character one by one and identify the corresponding tokens. This step-by-step approach will lay the foundation for our tokenizer, ensuring we extract the necessary information from the JSON data.

```ts
export const tokenizer = (input: string): Token[] => {
  let current = 0;

  while (current < input.length) {
    let char = input[current];

    current++;
  }
};
```

Alright, now that we've addressed that, we need another variable to store the tokens, right? Let's go ahead and add that.

```ts
export const tokenizer = (input: string): Token[] => {
  let current = 0;
  const tokens: Token[] = []; //Since we know the type of token we can make sure this array only accepts type Token.
  while (current < input.length) {
    let char = input[current];

    current++;
  }
};
```

In our JSON example:

```json
{
  "id": "647ceaf3657eade56f8224eb",
  "index": 0,
  "something": [],
  "boolean": true,
  "nullValue": null
}
```

First thing to token here is `BraceOpen`. Let's add this.

```ts
export const tokenizer = (input: string): Token[] => {
  let current = 0;
  const tokens: Token[] = [];

  while (current < input.length) {
    let char = input[current];

    if (char === "{") {
      tokens.push({ type: "BraceOpen", value: char });
      current++;
      continue;
    }
  }
};
```

So, if char is `BraceOpen`, we simply push it to `tokens` array and increment the current. Same goes for `BraceClose`,`BracketOpen`,`BracketClose`,`Colon` and `Comma` so let's add those as well.

```ts
export const tokenizer = (input: string): Token[] => {
  let current = 0;
  const tokens: Token[] = [];

  while (current < input.length) {
    let char = input[current];

    if (char === "{") {
      tokens.push({ type: "BraceOpen", value: char });
      current++;
      continue;
    }

    if (char === "}") {
      tokens.push({ type: "BraceClose", value: char });
      current++;
      continue;
    }

    if (char === "[") {
      tokens.push({ type: "BracketOpen", value: char });
      current++;
      continue;
    }
    if (char === "]") {
      tokens.push({ type: "BracketClose", value: char });
      current++;
      continue;
    }

    if (char === ":") {
      tokens.push({ type: "Colon", value: char });
      current++;
      continue;
    }

    if (char === ",") {
      tokens.push({ type: "Comma", value: char });
      current++;
      continue;
    }
  }
};
```

It's time to implement the trickiest part of all: handling String. Instead of copying the entire function repeatedly, I'll just show you the new ones.

```ts
if (char === '"') {
  let value = "";
  char = input[++current];
  while (char !== '"') {
    value += char;
    char = input[++current];
  }
  current++;
  tokens.push({ type: "String", value });
  continue;
}
```

The unique aspect of String values is that they are not single characters like Comma or Colon. When we encounter a Quote, our task is to iterate through the JSON string until we find the closing Quote. This function handles that process.

If we haven't reached the ending Quote yet, we continue building the string gradually by appending new characters to the value variable.

The rest of the process is relatively straightforward, and we can proceed smoothly with handling other token types.

Let's keep up the momentum and move forward!

```ts
// For number, boolean and null values
if (/[\d\w]/.test(char)) {
  // if it's a number or a word character
  let value = "";
  while (/[\d\w]/.test(char)) {
    value += char;
    char = input[++current];
  }

  if (isNumber(value)) tokens.push({ type: "Number", value });
  else if (isBooleanTrue(value)) tokens.push({ type: "True", value });
  else if (isBooleanFalse(value)) tokens.push({ type: "False", value });
  else if (isNull(value)) tokens.push({ type: "Null", value });
  else throw new Error("Unexpected value: " + value);

  continue;
}
```

We apply a similar technique that we used for handling String values to build a character array for `null`, `true`, `false`, or `number` data types. By doing so, we can systematically examine each character and identify the respective data types.

As we parse the characters and recognize the data type, we proceed accordingly. If none of these data types match, we handle the situation by throwing an `Unexpected value` error.

Here are the utilies for them:

```ts
//utils.ts

export const isBooleanTrue = (value: string): boolean => value === "true";
export const isBooleanFalse = (value: string): boolean => value === "false";
export const isNull = (value: string): boolean => value === "null";
export const isNumber = (value: string): boolean => !isNaN(Number(value));
```

Let's finish off with whitespace skipping and default condition to handle unknown/unexpected chars.

```ts
// Skip whitespace
if (/\s/.test(char)) {
  current++;
  continue;
}

throw new Error("Unexpected character: " + char);
```

Finished version of `tokenizer.ts`

```ts
import { Token } from "./types.js";
import { isNumber, isBooleanTrue, isBooleanFalse, isNull } from "./utils.js";

export const tokenizer = (input: string): Token[] => {
  let current = 0;
  const tokens: Token[] = [];

  while (current < input.length) {
    let char = input[current];

    if (char === "{") {
      tokens.push({ type: "BraceOpen", value: char });
      current++;
      continue;
    }

    if (char === "}") {
      tokens.push({ type: "BraceClose", value: char });
      current++;
      continue;
    }

    if (char === "[") {
      tokens.push({ type: "BracketOpen", value: char });
      current++;
      continue;
    }
    if (char === "]") {
      tokens.push({ type: "BracketClose", value: char });
      current++;
      continue;
    }

    if (char === ":") {
      tokens.push({ type: "Colon", value: char });
      current++;
      continue;
    }

    if (char === ",") {
      tokens.push({ type: "Comma", value: char });
      current++;
      continue;
    }

    if (char === '"') {
      let value = "";
      char = input[++current];
      while (char !== '"') {
        value += char;
        char = input[++current];
      }
      current++;
      tokens.push({ type: "String", value });
      continue;
    }

    // For number, boolean and null values
    if (/[\d\w]/.test(char)) {
      // if it's a number or a word character
      let value = "";
      while (/[\d\w]/.test(char)) {
        value += char;
        char = input[++current];
      }

      if (isNumber(value)) tokens.push({ type: "Number", value });
      else if (isBooleanTrue(value)) tokens.push({ type: "True", value });
      else if (isBooleanFalse(value)) tokens.push({ type: "False", value });
      else if (isNull(value)) tokens.push({ type: "Null", value });
      else throw new Error("Unexpected value: " + value);

      continue;
    }

    // Skip whitespace
    if (/\s/.test(char)) {
      current++;
      continue;
    }

    throw new Error("Unexpected character: " + char);
  }

  return tokens;
};
```

Let's move on to Parser.

## Parser

The parser is where we make sense out of our tokens. Now we have to build our Abstract Syntax Tree (AST).
The AST represents the structure and meaning of the code in a hierarchical tree-like structure. It captures the relationships between different elements of the code, such as statements, expressions, and declarations.

I highly suggest you to check this website to learn more about [AST](https://rajasegar.github.io/ast-builder/).

Every language or format you can think of uses some form of AST based on grammar rules of the programming language or data format being parsed. So, we will do that together now.

It's actually pretty similar to [tokenizer](#tokenizer). We will iterate over our tokens and form a tree depending on that value type.

Let's start by defining our type first in the `types.ts` file

```ts
//types.ts
export type ASTNode =
  | { type: "Object"; value: { [key: string]: ASTNode } }
  | { type: "Array"; value: ASTNode[] }
  | { type: "String"; value: string }
  | { type: "Number"; value: number }
  | { type: "Boolean"; value: boolean }
  | { type: "Null" };
```

Now, our `parser.ts` file.

```ts
//parser.ts
export const parser = (tokens: Token[]): ASTNode => {
  if (!tokens.length) {
    throw new Error("Nothing to parse. Exiting!");
  }
  let current = 0;

  function advance() {
    return tokens[++current];
  }
};
```

If token list is empty, we simply throw error. And, in order to iterate through our tokens we need a counter variable and a function to increment it.

Let's start by parsing simple values first.

```ts
//parser.ts
function parseValue(): ASTNode {
  const token = tokens[current];
  switch (token.type) {
    case "String":
      return { type: "String", value: token.value };
    case "Number":
      return { type: "Number", value: Number(token.value) };
    case "True":
      return { type: "Boolean", value: true };
    case "False":
      return { type: "Boolean", value: false };
    case "Null":
      return { type: "Null" };
    case "BraceOpen":
      return parseObject(); //Will be implemented soon
    case "BracketOpen":
      return parseArray(); //Will be implemented soon
    default:
      throw new Error(`Unexpected token type: ${token.type}`);
  }
}
```

The provided code snippet is relatively straightforward and handles basic data types like strings, numbers, booleans, and null using a simple switch statement.

However, when encountering a `BraceOpen` or `BracketOpen`, the parser needs to handle the nested objects and arrays recursively. This means calling `parseValue()` within `parseObject()` or `parseArray()` until all the inner key-value pairs or elements are evaluated.

For instance, when parsing an object represented by the following JSON data:

```json
{
  "id": "647ceaf3657eade56f8224eb",
  "index": 0,
  "person": {
    "name": "Oz",
    "address": "Somewhere magical"
  },
  "boolean": true,
  "nullValue": null
}
```

The parser needs to iterate through the object and call `parseValue()` for each key-value pair, handling nested objects and arrays recursively.

Let's add our `parseObject()`

```ts
//parser.ts
function parseObject() {
  const node: ASTNode = { type: "Object", value: {} };
  let token = advance(); // Eat '{'
  // Iterate through the tokens until we reach a BraceClose (end of object)
  while (token.type !== "BraceClose") {
    // Ensure that the token represents a valid string key
    if (token.type === "String") {
      const key = token.value;
      token = advance(); // Eat key
      if (token.type !== "Colon") throw new Error("Expected : in key-value pair");
      token = advance(); // Eat ':'
      const value = parseValue(); // Recursively parse the value
      node.value[key] = value;
    } else {
      throw new Error(`Expected String key in object. Token type: ${token.type}`);
    }
    token = advance(); // Eat value or ','
    // Check for a comma to handle multiple key-value pairs
    if (token.type === "Comma") token = advance(); // Eat ',' if present
  }

  return node;
}
```

In this code, we expect the ASTNode to represent an object, and we iterate through the tokens until we encounter a `BraceClose`, which marks the end of the object.

Within the loop, we check if the current token type is `String` to ensure that we are processing a key-value pair and not encountering another object. If it's a valid string key, we move forward by consuming the token and then expect to find a colon ":" separating the key from the value.

Once we find the colon, we recursively call `parseValue()` to parse the value of the key-value pair. This is important because the value might be another object or array, and we need to handle nested structures correctly.

We continue this process iteratively, consuming tokens and parsing key-value pairs until we reach the end of the object (marked by the `BraceClose` token). Along the way, we might encounter commas (",") between key-value pairs, and we skip them as they separate multiple key-value pairs within the object.

By repeating this process recursively, we can successfully parse all the inner objects and nested structures present in the JSON data.

Let's move onto `parseArray()`

```ts
//parser.ts
function parseArray() {
  const node: ASTNode = { type: "Array", value: [] };
  let token = advance(); // Eat '['

  while (token.type !== "BracketClose") {
    const value = parseValue();
    node.value.push(value);

    token = advance(); // Eat value or ','
    if (token.type === "Comma") token = advance(); // Eat ',' if present
  }

  return node;
}
```

This works in a similar fashion, as we parse new values we simply push them to array store in node object.

We actually finished our parser here is the full code:

```ts
//parser.ts
export const parser = (tokens: Token[]): ASTNode => {
  if (!tokens.length) {
    throw new Error("Nothing to parse. Exiting!");
  }
  let current = 0;

  function advance() {
    return tokens[++current];
  }

  function parseValue(): ASTNode {
    const token = tokens[current];
    switch (token.type) {
      case "String":
        return { type: "String", value: token.value };
      case "Number":
        return { type: "Number", value: Number(token.value) };
      case "True":
        return { type: "Boolean", value: true };
      case "False":
        return { type: "Boolean", value: false };
      case "Null":
        return { type: "Null" };
      case "BraceOpen":
        return parseObject();
      case "BracketOpen":
        return parseArray();
      default:
        throw new Error(`Unexpected token type: ${token.type}`);
    }
  }

  function parseObject() {
    const node: ASTNode = { type: "Object", value: {} };
    let token = advance(); // Eat '{'

    while (token.type !== "BraceClose") {
      if (token.type === "String") {
        const key = token.value;
        token = advance(); // Eat key
        if (token.type !== "Colon") throw new Error("Expected : in key-value pair");
        token = advance(); // Eat ':'
        const value = parseValue(); // Recursively parse the value
        node.value[key] = value;
      } else {
        throw new Error(`Expected String key in object. Token type: ${token.type}`);
      }
      token = advance(); // Eat value or ','
      if (token.type === "Comma") token = advance(); // Eat ',' if present
    }

    return node;
  }

  function parseArray() {
    const node: ASTNode = { type: "Array", value: [] };
    let token = advance(); // Eat '{'

    while (token.type !== "BracketClose") {
      const value = parseValue();
      node.value.push(value);

      token = advance(); // Eat value or ','
      if (token.type === "Comma") token = advance(); // Eat ',' if present
    }

    return node;
  }

  const AST = parseValue();

  return AST;
};
```

Now, in your `main.ts` you can do this to test it:

```ts
//parser.ts

import { parser } from "./parser.js";
import { tokenizer } from "./tokenizer.js";

console.log(
  parser(
    tokenizer(`{
  "id": "647ceaf3657eade56f8224eb",
  "index": 0,
  "anArray": [],
  "boolean": true,
  "nullValue": null
}
`)
  )
);
```

## Conclusion

And that's it! Today, we embarked on the journey of creating our very own JSON parser from scratch. It's been a thrilling ride, and we owe a huge shoutout to John Crickett for inspiring this adventure.

We learned about the crucial concept of tokenizing, breaking down the code into smaller, understandable parts. This sets the foundation for the parser to work its magic.

Our tokenizer expertly handles JSON strings and produces an array of tokens that capture the essence of the data structure.

Moving on to the parser, we built an Abstract Syntax Tree (AST) that neatly organizes the key-value pairs and nested structures of the JSON data.

It's incredible how much power we've packed into this parser, enabling us to handle various JSON data types and their complexities.

So, with our tokenizer and parser working hand in hand, we can confidently say that we've successfully crafted our very own JSON parser!

Now go forth and experiment with your newfound knowledge. Keep tinkering and exploring the fascinating world of programming. Until next time, happy coding! 🚀😄
