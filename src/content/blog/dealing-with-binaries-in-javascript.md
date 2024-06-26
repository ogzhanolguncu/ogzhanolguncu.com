---
pubDatetime: 2021-02-07
title: Dealing With Binaries in Javascript
slug: dealing-with-binaries-in-javascript
featured: false
draft: false
tags:
  - javascript
  - computerscience
description: Dealing with binaries in Javascript requires the knowledge of bitwise operators, bits, bytes, hexadeciamls. Those operators often come in handy when manipulating bits and bytes.
---

If you ever had to deal with binaries in Javascript, you know you can't escape from **_Bitwise_** operators, bits, bytes and hexadecimals. I know because, over the last two week or so,
I've spent my time to build a [CHIP-8](https://en.wikipedia.org/wiki/CHIP-8) emulator in Javascript, and I had to implement a CPU in Javascript. And, of course, without the knowledge of neither binaries nor bitwise operators
such implementation would be impossible. That is why, today, we are going to talk about how to become a kickass bitwise ninja, but before we start talking about binaries in general we should have solid understanding regarding:

- What is Binary ?
- What is Byte ?
- What is Hexadecimal ?

### Binary

As you may have heard, binaries nothing but 1s and 0s streaming through your hardware. In essence everything in our computers are binaries, but also in real life we somehow use binaries as well.
Logical example for binary would be a _Light Bulb_; a light bulb has only two states it's either open(1) or close(0). Now you may say, okay there are only 2 states in a light bulb, but how do only two digits make up all this stuff?
The good thing is we can combine the values like `0101` or `1000` etc. With having more 1s in hand we can construct a meaningful things such as:
_Colors_, _Strings_, _Numbers_.

| Length | Name   | Example  |
| ------ | ------ | -------- |
| 1      | Bit    | 1        |
| 4      | Nibble | 1111     |
| 8      | Byte   | 10111111 |

Everything is consist of **_Bits_**, **_Nibbles_** and **_Bytes_**. If there is only one it's a **_Bit_**, if there are 4 bits it's a **_Nibble_**, if there are 8 bits it's a **_Byte_**.
If you are curious, in Javascript to reveal the secret of binaries we have few options:

```javascript
0b1111; // If you type this in your browser's console it will prompt: 15
parseInt(1111, 2); // This will also prompt: 15

Number(15).toString(2); // toString() turns your value into base-2 format which is binary
```

If you are wondering how `1111` become `15` don't worry I got you. Key thing to remember everything is at base-2 format.

```javascript

   1       1       1         1
   ↓       ↓       ↓         ↓
   2³      2²      2¹        2⁰
   ↓       ↓       ↓         ↓
   8   +   4   +   2     +   1  = 15
```

Let's sum up **_Binaries_**

- It's in base-2 format.
- It's consist of bit.
- The prefix `0b` used.

### Hexadecimal

Hexadecimals(also base 16) aren't so different than binaries. If we wanted to display decimal `255` in binary format we would have something like this: `0b11111111` 8-bit long digits.
But, what if we wanted to display `4095` or `65535`. You see where this is going it's becoming more and more difficult to present them in binary(base-2) format. Instead of
displaying them as binaries people come up with hexadecimal to present them in more readable format.

| Decimal | Binary                | Hexadecimal |
| ------- | --------------------- | ----------- |
| 255     | 0b1111 1111           | 0xFF        |
| 4095    | 0b1111 1111 1111      | 0xFFF       |
| 65535   | 0b1111 1111 1111 1111 | 0xFFFF      |

To make these calculations at your browser:

```javascript
0x1111; // If you type this in your browser's console it will prompt: 4369
parseInt(1111, 16); // This will also prompt: 4369

Number(4369).toString(16); // toString() turns your value into base-16 format which is hexadecimal
```

Let's see how does your browser make that calculation.

```javascript

   1       1       1         1
   ↓       ↓       ↓         ↓
   16³      16²    16¹       16⁰
   ↓       ↓       ↓         ↓
 4,096  +  256  +  16    +   1  = 4369
```

Now, if you are curious about `0xFF`, in hexadecimal we are not limited by `1` and `0` we can also use other numbers up to `9`, but what comes after `9` ?
Let's see.

| Decimal | Hexadecimal | Binary |
| ------- | ----------- | ------ |
| 0       | 0           | 0000   |
| 1       | 1           | 0001   |
| 2       | 2           | 0010   |
| 3       | 3           | 0011   |
| 4       | 4           | 0100   |
| 5       | 5           | 0101   |
| 6       | 6           | 0110   |
| 7       | 7           | 0111   |
| 8       | 8           | 1000   |
| 9       | 9           | 1001   |
| 10      | A           | 1010   |
| 11      | B           | 1011   |
| 12      | C           | 1100   |
| 13      | D           | 1101   |
| 14      | E           | 1110   |
| 15      | F           | 1111   |

Now you have an adequate amount of knowledge to see why `0xFF` becomes `255`.

Let's sum up **_Hexadecimals_**

- It's in base-16 format.
- It's consist of bytes.
- Each Hexadecimal digit represents four bits.
- The prefix `0x` used.

## Bitwise Operators

**Bitwise** operations works on binary format at the level of individual bits and it's lot faster than doing arithmetic operations supported by programming languages.
If you are used to low-level programming, you are probably already familiar with these concepts. Nonetheless if you are trying to build a pseudo-CPU, low-level programming or
learn more about memory efficiency in Javascript, please, read on.

There are several operators:

- Bitwise AND (&)
- Bitwise OR (|)
- Bitwise XOR (^)
- Bitwise NOT (~)
- Bitwise Left Shift `(<<)`
- Bitwise Right Shift `(>>)`

### Bitwise AND (&)

The `And` operator(`&`) is quite simple it returns a `1` in each bit position for which the corresponding bits of both operands are `1`s.

```javascript

//If we apply & to this binaries

Binary #1      1 1 1 0
               | | | |
Binary #2      1 0 1 0
               ------- &
Result:        1 0 1 0  // Only takes 1s from both binaries

In Javascript: 0b1110 & 0b1010 // Returns 10


```

Practical example for `And`(`&`) would be bitmasking. A bitmask is a pattern of isolating the positions of bits we're interested in.
Let's suppose we are only interested in first 8 bits of first binary.

```bash
0100010000110010
        ^------^ Here is our 8bit
0000000011111111
---------------- &
0000000000110010
```

### Bitwise OR (|)

The `Or` operator(`|`) similar to `And`, but instead returns a 1 in each bit position for which the corresponding bits of either or both operands are 1s.

```javascript

Binary #1      1 1 1 0
               | | | |
Binary #2      1 0 1 0
               ------- |
Result:        1 1 1 0  // Takes 1s from both binaries

In Javascript: 0b1110 | 0b1010 // Returns 14

```

### Bitwise XOR (^)

The `Xor` operator(`^`) returns a 1 in each bit position for which the corresponding bits of either but not both operands are 1s.

```javascript

Binary #1      1 1 1 0
               | | | |
Binary #2      1 0 1 0
               ------- ^
Result:        0 1 0 0  // If only one of two bits is 1, then set bit to 1

In Javascript: 0b1110 ^ 0b1010 // Returns 4

```

### Bitwise NOT (~)

The `Not` operator(`~`) one of the easiest among others we simply invert 1s to 0s and 0s to 1s.

```javascript

Binary #1      1 1 1 0
               ------- ~
Result:        0 0 0 1  // if only one of two bits is 1, then set bit to 1

In Javascript: ~0b1110 // Returns -15
```

### Bitwise Left Shift

The `Left Shift` operator`(<<)` simply adds 0s to right of your binary by shifting others to left. This is generally used when we want to make room at the end of
our binary.

```javascript

Binary #1      1 1 1 0
               ------- << 8
Result:        1 1 1 0 0 0 0 0  // if only one of two bits is 1, then set bit to 1

In Javascript: 0b11100000 << 8 // Returns 57344
```

Every shift left also multiplies your number as much as you shift left. If you shift `0b1110` `<<` `1` this will give us 28 since `0b1110` was 14.

### Bitwise Right Shift

The `Right Shift` operator(`>>`) deletes from right as much as your shift value.

```javascript

Binary #1      1 1 1 0
               ------- >> 1
Result:        0 1 1 1  // if only one of two bits is 1, then set bit to 1

In Javascript: 0b1110 >> 1 // Returns 7
```

That's all there is to it.

## Roundup

- Performing some operations at binary level will be faster than regular operations.
- The bitwise operators are mandatory if we have to deal with cases like **bitmasking**.
- Must learn the shifting operations if we are saving some space or clipping a part for future use.
