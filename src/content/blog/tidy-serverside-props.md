---
pubDatetime: 2022-10-16
title: Tidying up getServerSideProps(Server-Side Rendering) with Higher Order Functions
slug: tidy-serverside-props
tags:
  - nextjs
  - typescript
description: Using higher order functions to compose getServerSideProps to achieve cleaner and more organized code.
---

We've all been there; once our project gets bigger, `getServerSideProps` starts to become a pain in the ass to manage.
Because we have to deal with caching, data-fetching, auth checks, and data formatting to decrease the complexity of the client.
The size of the `getServerSideProps` gets considerably big.

When this happens, it reduces Developer Experience(DX) highly; for that reason, developers need to hop around to find the code they want.
You might have heard something like this when you first saw a big `getServerSideProps` - "Where the hell is the cache headers" or "Where do we do the auth checks".

Now, you might be thinking - These are all pretty easy to dodge if you just extract some code into meaningful functions.
And you are right. It is possible to do that, but they will make your `getServerSideProps` very dense and verbose.

Let's take a closer look at code here:

```typescript
export async function getServerSideProps({ req, res }) {
  const userIsAuthenticated = req.auth.user.id;
  if (!userIsAuthenticated) {
    return {
      redirect: {
        permanent: false,
        destination: "/world-without-cookie",
      },
    };
  }

  /*
    Big logging section
    */

  /*
    Check if the data available in redis or memcache
    */

  /*
    If not get data from Db
    */

  /*
    Format data for the client
    */

  res.setHeader("Cache-Control", "public, s-maxage=10, stale-while-revalidate=59");

  return {
    props: {
      time: new Date().toISOString(),
    },
  };
}
```

We can turn this into this:

```typescript
export async function getServerSideProps({ req, res }) {
  bounceUsers(req);
  logStuff(req);
  const cacheData = getCacheData(req);
  const dbData = getDataFromDb();
  const formatData = formatDataForClient(cacheData, dbData);

  res.setHeader("Cache-Control", "public, s-maxage=10, stale-while-revalidate=59");

  return {
    props: {
      data: formatData,
    },
  };
}
```

I would pick the latter in this case. But there is always room for improvement. We can still increase the readability of our code by separating it into individual higher-order functions.
Therefore, functions will be aware of only the parts they require, and developers won't have to hop around to spot the code and will be able to locate the chunk of code they need in a blink of an eye.

Let's refactor our code into a more functional way:

```typescript
type Options = {
  kickUser: boolean;
};

type InjectedProps = {
  userLocation: string;
};

type GetServerSidePropsWithInjectedProps = GetServerSidePropsContext & InjectedProps;

type Callback = (
  context: GetServerSidePropsWithInjectedProps
) => Promise<GetServerSidePropsResult<any>>;
```

If you are working with Typescript, you first need to add a couple of types to make it work with TS. Don't worry about `InjectedProps` and `Options`, for now, will get there in a moment.

```typescript
export async function getServerSideProps({ req, res }) {
  const userIsAuthenticated = req.auth.user.id;
  if (!userIsAuthenticated) {
    return {
      redirect: {
        permanent: false,
        destination: "/world-without-cookie",
      },
    };
  }

  return {
    props: {
      time: new Date().toISOString(),
    },
  };
}
```

Let's first turn this into a Higher Order Function.

```typescript
export const bounceUsersIfCredentialsHaveNotMet = (cb: Callback, options?: Options) => {
  return async (ctx: GetServerSidePropsWithInjectedProps) => {
    const userIsAuthenticated = ctx.req.auth.user.id;

    if (options?.kickUser && userIsAuthenticated) {
      return {
        redirect: {
          permanent: false,
          destination: "/world-without-cookie",
        },
      };
    }

    const getUserLocation = await magicalLocationFinderFunction();
    const injectedContext = {
      ...ctx,
      userLocation: getUserLocation(),
    };
    return cb?.(injectedContext) || {};
  };
};

const getServerSideHomeProps = async (context: GetServerSidePropsWithInjectedProps) => {
  return {
    props: {
      message:
        "Me cookie monster. That all there is to it. Me love to eat cookie. Sometimes eat whole, sometimes me chew it.",
    },
  };
};

export const getServerSideProps = bounceUsersIfCredentialsHaveNotMet(getServerSideHomeProps, {
  kickUser: false,
});
```

If you are familiar with the concept of Higher Order Functions(HOC), that shouldn't look so strange to you. In the essence all we did was to wrap our `getServerSideHomeProps` with `bounceUsersIfCredentialsHaveNotMet`.

So when we get a request, we'll first check if the user is authenticated in the way we wanted; if so, we'll check the argument we've passed `kickUser`. Then, if all the conditions are met, we will let the user move into the `getServerSideHomeProps` and pass a message to the client. And we also injected additional info into our context to see users' locations. We can easily enrich our context with this method.

Let's configure cache headers and data fetching.

```typescript
type Options = Partial<{
  kickUser: boolean;
  cacheMaxAge: number;
}>;

export const bounceUsersIfCredentialsHaveNotMet = (cb: Callback, options?: Options) => {
  return async (ctx: GetServerSidePropsWithInjectedProps) => {
    const userIsAuthenticated = ctx.req.auth.user.id;

    if (options?.kickUser && !userIsAuthenticated) {
      return {
        redirect: {
          permanent: false,
          destination: "/world-without-cookie",
        },
      };
    }

    const getUserLocation = await magicalLocationFinderFunction();
    const injectedContext = {
      ...ctx,
      userLocation: getUserLocation(),
    };
    return cb?.(injectedContext) || {};
  };
};

export const setCacheHeaders = (cb: Callback, options?: Options) => {
  return async (ctx: GetServerSidePropsWithInjectedProps) => {
    ctx.res.setHeader(
      "Cache-Control",
      `public, s-maxage=${options?.cacheMaxAge}, stale-while-revalidate=59`
    );
    return cb?.(ctx) || {};
  };
};

export const fetchData = (cb: Callback, options?: Options) => {
  return async (ctx: GetServerSidePropsWithInjectedProps) => {
    const formattedData = await getDataFromDbOrCache();
    const injectedContext = {
      ...ctx,
      formattedData,
    };
    return cb?.(injectedContext) || {};
  };
};

const getServerSideHomeProps = async (context: GetServerSidePropsWithInjectedProps) => {
  const formattedData = context.formattedData;
  return {
    props: {
      message:
        formattedData ??
        "Me cookie monster. That all there is to it. Me love to eat cookie. Sometimes eat whole, sometimes me chew it.",
    },
  };
};

export const getServerSideProps = bounceUsersIfCredentialsHaveNotMet(
  setCacheHeaders(fetchData(getServerSideHomeProps), { cacheMaxAge: 1000 }),
  {
    kickUser: false,
  }
);
```

As you can see this pattern can easily scale with your needs. And, through this pattern we can easily evade bloated `getServerSideHomeProps`.

Pros of this pattern

- Can easily scale
- Atomic
- More declarative than regular `getServerSideProps`
- Easier to debug
- Wrappers can be easily reused

Cons of this pattern

- Might be hard to understand at the first look

The pros outweigh the cons. But, still, if your needs are not as sophisticated as these, don't bother to implement this pattern into every single SSR function. Don't forget to keep it simple.

[🔗Project's Gist address](https://gist.github.com/ogzhanolguncu/609237854aff09a327f6e08f4be5dd46)
