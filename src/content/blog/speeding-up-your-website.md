---
pubDatetime: 2021-01-31
title: Speeding Up Your Website
slug: speeding-up-your-website
tags:
  - webpack
  - optimization
  - react
description: Techniques to speed up your website and improve the user experience that specifically aiming to React and Next.js sites. We'll discuss things like bundles, fonts, unicode-ranges, webpack.
---

## Table of Contents

1.  [Web Safe Fonts](#web-safe-fonts)
2.  [Font Display](#font-display)
3.  [Unicode Ranges](#unicode-ranges)
4.  [Preloading](#preloading)
5.  [Google Fonts](#google-fonts)
6.  [Images](#images)
7.  [Using Alternative Packages](#using-alternative-packages)
8.  [Unused Dependencies](#unused-dependencies)
9.  [Staying Up To Date With Dependencies](#staying-up-to-date-with-dependencies)
10. [Conclusion](#conclusion)

Today, we will talk about techniques that I used to speed up my very own website. I was quite curious about what tricks people were using to optimize their
blogs, portfolios to increase user experience. And, I'm wickedly obsessed when it comes to optimization. So I look further to see if there were any ways to optimize like
reducing bundle sizes, optimizing google fonts, using different bundles for the development environment and production environment, tricks to utilize for custom fonts.
Finally, here we're, on an optimized website. Let's first see the _**GTmetrix**_ score.

![gtmetrix-site-performance](/blog-images/speeding-up-your-website/gtmetrix.png)

As can be seen, there isn't much to squeeze out in terms of performance. Now, we will dissect these process step-by-step and see how to achieve a score like this.

## Fonts

### Web Safe Fonts

If you're aiming for the best you can get, do not even consider using anything but browsers _**Web Safe Fonts**_. By _**Web Safe Fonts**_ I mean:

- Arial (sans-serif)
- Verdana (sans-serif)
- Helvetica (sans-serif)
- Tahoma (sans-serif)
- Trebuchet MS (sans-serif)
- Times New Roman (serif)
- Georgia (serif)
- Garamond (serif)
- Courier New (monospace)
- Brush Script MT (cursive)

These are highly accessible fonts pretty much for all the browsers since they already installed on your computer,
so prioritize them over [Google Web Fonts](https://fonts.google.com/) or [Adobe Fonts](https://fonts.adobe.com/).

### Font Display

```css
@font-face {
  font-family: ExampleFont;
  src:
    url(/path/to/fonts/examplefont.woff) format("woff"),
    url(/path/to/fonts/examplefont.eot) format("eot");
  font-weight: 400;
  font-style: normal;
  font-display: optional;
  unicode-range: U+0020-007F, U+0100-017F;
}
```

`font-display` plays a huge role for **Cumulative Layout Shift (CLS)** and of course for the performance. So, best to go with
`optional` for performance and `swap` for decrease **CLS**.

> Supported by all modern browsers.

### Unicode Ranges

Specifying the `unicode-ranges` beforehand tells the browsers to only download necessary characters that going to be used. Since we don't need characters
like Arabic, Greek, Hebrew, etc. Of course, if you are not using those characters 🙂.

> Supported by all modern browsers. See the list for [unicodes](https://jrgraphix.net/research/unicode_blocks.php).

### Preloading

```html
<link
  href="/fonts/Avenir-Roman.ttf"
  as="font"
  type="font/ttf"
  rel="preload"
  crossorigin="anonymous"
/>
```

The `preload` means that you will need this font very soon after page loading, so load them first and then move onto others, before browsers' main rendering
kicks in. Therefor, `preload` does not block the page's render and improves overall performance.

### Google Fonts

```html
<link rel="preconnect" href="https://fonts.gstatic.com" />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

When using Google fonts always use `preconnect` first, the browser will start a new connection between origin and receiver to make things faster,
thus improving our websites' user experience and speed. And, pick the `font-weights` you need because more `font-weight` means bigger file to download, so choose wisely.

## Images

There are not much to talk about images but always strive for smaller images you can get. For example, the image on my landing page is only 50kb, by the way, this is
the smallest it can get.

> Use [TinyPng](https://tinypng.com/) to compress your images without losing quality.

## Using Alternative Packages

Since this websites runs on React only way to decrease the bundle size was to use [Preact](https://preactjs.com/) 3kB alternative for React.
If you are using Webpack as a bundler like me, you can follow the steps to implement this. By the way, I'm using preact for production version.

- First, install react `yarn add preact`
- Then, configure your webpack bundler as shown below.

```javascript
webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      Object.assign(config.resolve.alias, {
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat',
      });
    }
    return config;
  },
```

Apart from that example, you also analyze your packages through Google Lighthouse, which offers alternative smaller packages for current ones.

![recommend-alternative-package](/blog-images/speeding-up-your-website/alternative-package.jpg)

## Unused Dependencies

Look through your dependencies inside `package.json`, locate and delete unused ones. Because even if you don't use packages in `package.json` they will still
be inside your final bundle, thus will make your bundle bigger, therefore make it load slower.

## Staying Up To Date With Dependencies

Staying up to date with the latest dependencies may seem unnecessary at first, but sometimes developers improve their packages in terms of both speed and size. For example, Next.js 10's core packages have been reduced by 16%. They introduced a code-splitting strategy. All these happened because they added
their built-in Image component to the codebase. Before they have introduced this image component, I was using an external package to use images. I've omitted this one right away once I upgraded to Next.js 10.

## Conclusion

- Use _Web Safe Fonts_.
- `Preload` your font file.
- Preconnect to _Google Fonts_.
- Use `font-display: optional` or `font-display: swap` for performance and CLS.
- Use only `unicode-range` you need.
- Do not include `font-weight` you don't need to _Google Fonts_.
- Compress your images.
- Use smaller alternative packages for your production bundle, such as _Preact_.
- Remove unused dependencies.
- Stay up to date with dependencies.
