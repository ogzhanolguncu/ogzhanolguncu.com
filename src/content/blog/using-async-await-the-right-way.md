---
pubDatetime: 2020-10-23
title: Using Async/Await The right way
slug: using-async-await-the-right-way
tags:
  - javascript
  - asynchronous
  - tutorial
description: Learn how to use async/await right way
---

When async/await operations first introduced devs got hyped up about how things going to be clearer, shorter and faster. But, the problem was we were still writing synchronous code. Like, procedures work in order line by line but this is not how async works. In [MDN Docs](https://developer.mozilla.org/) Async defined as **Asynchronous functions operate in a separate order than the rest of the code via the event loop, returning an implicit Promise as its result.** So, If you have a long-running task such as Db queries or bulky API calls this is the right way to handle. Yet, using **await** keyword to resolve for every long-running task can be detrimental. I'm going to demonstrate how to use async effectively. I've used Axios for requests and Performance-now for calculating the execution time.

![Alt Text](/blog-images/using-async-await-the-right-way/1.png)

Suppose we have two APIs one for Pokemon and another for Digimon. From line 7 to 11 we just want to do operations related to pokemon. Now, you may ask: Why did you make Digimon call then, Right? To show the impact of await of course. So, it is okay to put two API calls side by side that is completely okay unless you use **await**. The question you should always be asking is, _"Do I really need data coming from API at the next line?"_ If, the answer is no then avoid **await**. Even if you are not going to use Digimon data **await** will try to resolve it and resolving async operations takes a toll on your program. As you can see at **Terminal** output this program takes 2539 ms. Now, check this out.

![Alt Text](/blog-images/using-async-await-the-right-way/2.png)

This one takes 282 ms. So the thread is still not blocked but it takes 10 times shorter time to execute. Now, let's iterate over these APIs 50 times.

![Alt Text](/blog-images/using-async-await-the-right-way/3.png)

Approximately 40 seconds. Now without Digimon await.

![Alt Text](/blog-images/using-async-await-the-right-way/4.png)

Without await, it takes 10 seconds. So the difference is 30 seconds that is not something we can unsee. If we increase the number of iterations difference will even greater.

<h3>Final Thoughts</h3>

As you can see how single **await** can hinder the performance of your program. Don't think sync when you are programming async. Always ask, _"Do I really need that data right now?"_
