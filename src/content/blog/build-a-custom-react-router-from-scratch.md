---
pubDatetime: 2021-01-16
title: Build a Custom React Router From Scratch
slug: build-a-custom-react-router-from-scratch
featured: false
draft: false
tags:
  - typescript
  - tutorial
  - react
description: Have you ever wondered how react router works under the hood? If that's the case best way to explore is to build a custom react router from scratch.
---

## Table of Contents

## Live Example

[Custom React Router Example](https://codesandbox.io/embed/custom-react-router-hg02m?autoresize=1&fontsize=14&theme=dark&view=preview)

Have you ever wondered how react-router works under the hood? If that's the case best way to explore is to build a custom react router from scratch.
To do that we need to know which APIs utilized by react-router. As we all know, react-router actually use [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API), which is native API of the browser.

> The DOM Window object provides access to the browser's session history through the history object. It exposes useful methods and properties that let you navigate back and forth through the user's history, and manipulate the contents of the history stack.
> [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/History_API)

**_History_** object enables us to manipulate the routing on the current window. It has lot's of methods such as `window.history.forward()`,
`window.history.back()` which moves forward and backwards respectively, like click on a back and forward button on your favorite browser.
Since, we now have more knowledge about **_History API_** we can start talking about react-routers fundamental components like `Link`, `Route`, `Router`.

## Route

`Route` is actually a basic component which accepts `path` and `children` as parameters to navigate to that URL and render the given children elements.

## Link

`Link` also accepts `path`, `onClick` and `children` to render. If given `path` is valid pushes the user to the desired location.
The main way to allow users to navigate around your application.

## Router

`Router` is the parent of all other components in the component tree. In essence everyting related with routing goes into `Router`.
In our case, `Router` gonna be our `Provider` which utilizes `ContextAPI` to pass down all the shared things across our router.

So, we get the basic idea. Let's start building our project.

```powershell
npx create-react-app my-app --template typescript
```

This give us a solid template to work on with Typescript support. Let's install our dependencies and check out our project structure.

### Dependencies

```powershell
yarn add history querystringify @types/querystringify @types/history
```

### Project Structure

```powershell
/src
  /router
    Link.tsx
    Route.tsx
    RouterContext.tsx
    Utils.ts
  404.tx
  index.tsx
  routes.tsx
```

## Utils

```typescript
import { Location, State } from "history";
import qs from "querystringify";

type Props = {
  location: Location<State>;
};

export function locationToRoute({ location }: Props) {
  return {
    path: location.pathname,
    hash: location.hash,
    query: qs.parse(location.search),
  };
}
```

We first define our `locationToRoute()` which accept location, by the way, `Location` contains
information about the URL path and things like **_path_**, **_hash_**, **_query_**. And, to capture the query parameters we use `qs.parse()`.

## RouterContext Component

```typescript
import React, { useContext, useLayoutEffect, useState } from 'react';
import { createBrowserHistory, Location, State } from 'history';
import { locationToRoute } from './Utils';
import { NotFound } from '../404';
import { RoutesType } from '../routes';

const history = createBrowserHistory();
export const RouterContext = React.createContext({
  route: locationToRoute(history),
});

type Props = {
  routeList: RoutesType;
  children: React.ReactNode;
};

const RouterProvider = ({ routeList, children }: Props) => {
  const [routes] = useState(Object.keys(routeList).map((key) => routeList[key].path));
  const [route, setRoute] = useState(locationToRoute(history));

  const handleRouteChange = (location: { location: Location<State> }) => {
    const route = locationToRoute(location);
    setRoute(route);
  };
  const is404 = routes.indexOf(route.path) === -1;

  useLayoutEffect(() => {
    let unlisten = history.listen(handleRouteChange);
    return () => {
      unlisten();
    };
  }, []);

  return (
    <RouterContext.Provider value={{ route }}>
      {is404 ? <NotFound /> : children}
    </RouterContext.Provider>
  );
};

const useRouter = () => useContext(RouterContext);

export { useRouter, RouterProvider, history };
```

We first, define `createBrowserHistory()` to store the location in URLs. Then, create a `React.createContext()` to pass our values down.
Then, inside our `RouterProvider` we define a state called routes. `routes` let us check which routes are proper or not, and if they are not our `is404()` catches it.
And, we got `handleRouteChange()` function which is very crucial to set which route to navigate.

We now have only two parts left. One of them is `useLayoutEffect()` to be able to listen changes in the route we use `useLayoutEffect()` it also
fires synchronously right after all DOM manipulations end. In it's the cleanup function we just call `unlisten()`. And, finally, we return our
`RouterContext.Provider` with the value of the current route and define our `useRouter()` hook.

## Route Component

```typescript
import React from 'react';
import { RouterContext } from './RouterContext';

type Props = {
  children: React.ReactNode;
  path?: string;
};

export function Route({ path, children }: Props) {
  // Extract route from RouterContext
  const { route } = React.useContext(RouterContext);

  // Return null if the supplied path doesn't match the current route path
  if (route.path !== path) {
    return null;
  }

  return <>{children}</>;
}
```

## Link Component

```typescript
import React from 'react';
import { useRouter, history } from './RouterContext';

type Props = {
  to: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<Element, MouseEvent>) => void;
};

export function Link({ to, children, onClick, ...props }: Props) {
  const { route } = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (route.path === to) {
      // If it's not a valid path function will not trigger.
      return;
    }
    if (onClick) {
      onClick(e);
    }
    history.push(to);
  };

  return (
    <>
      <a {...props} onClick={handleClick}>
        {children}
      </a>
    </>
  );
}
```

## 404 Component

```typescript
import React from 'react';
import { Link } from './router/Link';
import { routes } from './routes';

export function NotFound() {
  return (
    <div>
      <p>404 - Not Found</p>
      <Link to={routes.home.path}>Back to home</Link>
    </div>
  );
}
```

## Route.ts

```typescript
export type RoutesType = { [route: string]: { path: string } };

export const routes: RoutesType = {
  home: {
    path: "/",
  },
  about: {
    path: "/about",
  },
};
```

## Let's bring everything together

## Index.tsx

```typescript
import React from 'react';
import ReactDOM from 'react-dom';
import { RouterProvider } from './router/RouterContext';
import { Link } from './router/Link';
import { Route } from './router/Route';
import { routes } from './routes';

function App() {
  return (
    <RouterProvider routeList={routes}>
      <Route path={routes.home.path}>
        <p>Homepage</p>
        <Link to={routes.about.path}>Go to about</Link>
      </Route>

      <Route path={routes.about.path}>
        <p>About</p>
        <Link to={routes.home.path}>Go to home</Link>
      </Route>
    </RouterProvider>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
```

As if we use react-router, we first define our provider and supply it's routes which we defined earlier. Now, we can freely
use `RouteComponent` and `LinkComponent` in our entire app.

Reason behind building our custom react router is actually praticing the basics of `historyAPI` and see what's really going under the hood.
Before diving into using libraries every developer should learn the ideas behind those libraries, and try building a basic, functioning example of it.
