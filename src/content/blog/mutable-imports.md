---
pubDatetime: 2022-07-03
title: You can actually mutate imports in Javascript
slug: mutable-imports
tags:
  - javascript
description: Do you know you can actually mutate an imported object in JS? Today, we will see how to mutate and avoid mutation for imported objects.
---

Recently, I've realized that you can mutate imported objects in Javascript. Interesting right? I've always thought imported objects give us fresh copies each time they are requested/accessed - apparently not.

And mutation not only impacts the file you requested the import, but mutation also happens in all the files that particular import is being used.

E.g, you cannot expect to have the same outcome when you import a file **catList** and mutate it in file **catListPopper**, then, import the **catList** in the **catListLooker**. Because, now both **catList** and **catListLooker** share the mutated import - same reference.

Let's elaborate.

![Mutating cat file](/blog-images/mutable-imports/diagram.png)

You can imagine this diagram as a backend application. An API endpoint imports an object and mutates it, then, maybe returns a JSON object as a result. Then, another file tries to
imports the `cat.js`, but instead of getting an array of objects with full of cats, gets an empty array as result. Why? Due to Javascript's nature, objects are not immutable by default and
imports do not restart their states after being called.

In order to understand this behaviour we need to get a level deeper. These days, we use bundlers such as Webpack or SWC to run and customize our codes. What they do is, they boil down all the code
into a single file and let them share the same/common lexical scope - so we don't have to download each file individually when we requested a website. Let's try to reproduce the scenario above.

![Bundling them together](/blog-images/mutable-imports/bundle.png)

Even though we think we work in different files, in reality we are actually working in a single file at the end. But, preventing this behaviour is actually pretty easy.

![Bundling them together](/blog-images/mutable-imports/bundler-without-mutation.png)

As you can see once we copied the `CatList` into different variable, `console.log` and `pop()`, they both reference the different objects.

```javascript
var n = [{ name: "Cat1" }, { name: "Cat2" }, { name: "Cat3" }, { name: "Cat4" }];
//function that copies catlist into some other variable.
console.log(n);
a.pop(), a.pop(), a.pop(), a.pop();
```

We successfully prevented the mutation of an object.

## Conclusion

It's important to keep the code as mutation free as possible to get rid of those unwanted behaviours. With a simple copy, you can save yourself from hours of working.
So, new time think twice while importing and mutating objects. Stay mutation free!
