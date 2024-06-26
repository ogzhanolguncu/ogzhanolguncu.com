---
pubDatetime: 2021-12-26
title: The Mystical World of Solidity Intro to Smart Contracts
slug: mystical-world-of-solidity
tags:
  - solidity
description: Have you ever wondered how to interact with Ethereum through Smart Contracts? Solidity is here to help you with the help of Remix.
---

Have you ever wanted to program the Blockchain before but failed? If you have, don't worry. In this tutorial, our sole focus will be on Solidity.
We won't be diving into details about Metamask or how to integrate a smart contract into your web apps. Let me be frank, throwing lots of technologies or methodologies at the beginning of the learning process makes it a lot harder to digest.

So, in this tutorial, we will try to come up with some Lottery smart contract without using fancy tools - similar to a real-world lottery, you place some money and get some amount of money in return if you win.
Everybody can participate in exchange for some ethers. If in the end, you are the winner you'll have all the money in the contract.
Now, you might be asking yourself, "What the hell is ether" or "But, how do I send ether to contract".

Okay, let's start from the first one. You probably had heard ether before, but if you haven't, I will briefly explain.
Ether is the currency used in the Ethereum blockchain to incentivize miners and stake owners. And, of course, for gas prices - gas price is a transaction fee but with a fancy name.
If you try to interact with a contract or send some ether to another address - unique characters similar to our IDs - you have to pay some ethers usually in small amounts.

I know I told you we won't be using anything but Solidity. But we need an IDE/Editor to write our very first contract, and, lucky for us, there is a development environment called [Remix](https://remix.ethereum.org/) not the library Remix. It's an IDE for Ethereum development built on top of the web where you can compile, deploy and test your smart contracts.

There are some steps in Solidity development:

- Create your contract through Remix, Hardhat or Truffle
- Compile your contract
- Test & Deploy your contract

We will start off with the first one. Navigate to [Remix](https://remix.ethereum.org/) follow the steps below.

![Smart Contracts in Ethereum](/blog-images/mystical-world-of-solidity/create-contract.gif)

Then, paste this Solidity codes and we go over each line and explain what it does.

```javascript
// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Lottery {
    address payable[] public players;
    address public manager;

    constructor() {
        manager = msg.sender;
    }

    receive() external payable {
        require(msg.value == 1 ether);
        players.push(payable(msg.sender));
    }

    function getBalance() public view returns (uint256) {
        require(msg.sender == manager);
        return address(this).balance;
    }

    function random() public view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.difficulty,
                        block.timestamp,
                        players.length
                    )
                )
            );
    }

    function pickWinner() public {
        require(msg.sender == manager);
        require(players.length >= 3);

        uint256 r = random();

        uint256 index = r % players.length;
        players[index].transfer(getBalance());

        delete players;
    }
}

```

The `pragma` is telling the Solidity compiler to look for certain features or checks. No more different then Node or NPM version. Then, we have the `contract` if we are looking for
a resemblance in other languages it's safe to say `contract` is a `class` like keyword.

Then, we have our state variables. Those variables will be stored on the blockchain and persist. There are only a couple of data types, by the way.

```bash
    address payable[] public players;
    address public manager;
```

### Data Types in Solidity

- boolean
- uint
- int
- address
- address payable - address that receives ether exposes `transfer` and `send`

Now that we cleared that out. Let's continue. We've defined two variables, one for storing users who participated in the lottery and one for the manager itself.
Since users will be more than one, we defined it as an array. And, since we want all those variables to be accessible outside of the contract, we marked them as `public`.

By the way, there are couple of accessors.

### Accessors in Solidity

- public - Everyone can access
- external - Only for external use and can not be invoked within the contract
- internal - Only for this and derived contract can use
- private - Only for this contract, not available for derived contract

Then, we have the `constructor` - optional function and only executed during the contract creation.
In our constructor, we specify the "manager" will be the one who created the contract. If you are asking yourself, "Where does `msg.sender` come from".
The `msg` is a built-in variable that carries some metadata about the transaction.

```javascript
  constructor() {
        manager = msg.sender;
    }
```

### MSG Variable

- msg.data (bytes calldata): complete calldata

- msg.sender (address): sender of the message (current call)

- msg.sig (bytes4): first four bytes of the calldata (i.e. function identifier)

- msg.value (uint): number of wei sent with the message

Then, we have `receive()` which is also special function/variable just like `msg` - [Special Variables and Functions](https://docs.soliditylang.org/en/develop/units-and-global-variables.html?highlight=special%20variables%20and%20functions#special-variables-and-functions).
The `receive()` says this contract accepts ether from outside. Dead simple.

```javascript
    receive() external payable {
        require(msg.value == 1 ether);
        players.push(payable(msg.sender));
    }
```

Next up, we have `require()` which, helps us make assertions. We are making sure that anyone willing to participate gotta send exactly **1** ether. But, why didn't we use `if`?. The reason is every contract interaction in Solidity consumes gas -transaction fee- therefore, we have to be rigorous about it.

Imagine that scenario below:

```javascript
  receive() external payable {
      /*


      sprinkling some fairy dust
      bunch of operations that modifies blockchain


      */
        if(msg.value == 1 ether) {
            players.push(payable(msg.sender));
        }
    }
```

If you were to send **2** ether instead of **1**, you wouldn't get your gas -transaction fee- back. Because, `if` does not revert the contract interaction, but `require()` do.

So, if you don't wanna spend peoples ethers for nothing always go with `require()` and make sure they got their ethers back if interaction fails.

Inside `receive()`, if conditions are met, we add a participant to `players` array and increase contracts balance.

Next up, we have `getBalance()`. First, we make sure, the caller is the owner, then access the balance of the contract. The `address(this)` is used to access the contract's address object.

```javascript
    function getBalance() public view returns (uint256) {
        require(msg.sender == manager);
        return address(this).balance;
    }
```

Before we move on, we have one more thing we haven't covered yet, the `view`. If you are not planning to modify the state, you need to pass the `view` keyword to the function.
If you are curious about which actions modify the state, there they are.

### State modifiers

- Writing to state variables.

- Emitting events.

- Creating other contracts.

- Sending Ether via calls.

- Calling any function not marked view or pure

Next up, we have `random()`. A pretty generic function that returns random numbers using [keccak](https://keccak.team/keccak_specs_summary.html) algorithm. If your goal is to create a random number generator function in the blockchain -pseudorandom-, this is the code you eventually end up with.

```javascript
    function random() public view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.difficulty,
                        block.timestamp,
                        players.length
                    )
                )
            );
    }
```

Now, our contract's final and most important part is `pickWinner()`. But, before calling `pickWinner()`, we need to ensure that caller is the owner and at least three players participated in the lottery.
To achieve that, we use `require()`. Then, we use `random()` to generate a random number and use a modulo to find a random number between 0 and our players' length. After the number has been picked we transfer all
the money in the contract to the winner via `transfer()`. And for reusability, we use `delete` to reset the players' array.

```javascript
       function pickWinner() public {
        require(msg.sender == manager);
        require(players.length >= 3);

        uint256 r = random();

        uint256 index = r % players.length;
        players[index].transfer(getBalance());

        delete players;
    }
```

Now that we have completed our contract it's time to compile it.

![Compiled Contract](/blog-images/mystical-world-of-solidity/compile-contract.gif)

Everything is ready for the test in fake [EVM](https://ethereum.org/en/developers/docs/evm/)(Ethereum Virtual Machine).

![Deployed and Tested Contract](/blog-images/mystical-world-of-solidity/deployed-contract.webp)

We've deployed our contract from an account, then made three different contract calls and sent one ether from each account. In the end, one of the accounts received the prize sum.
I purposely didn't show all the functionalities of our contract. Like, testing out `getBalance()` to check if the caller is the owner or `pickWinner()` without at least three players.
I highly recommend you to test each function by yourself to get to know Remix and Solidity.
