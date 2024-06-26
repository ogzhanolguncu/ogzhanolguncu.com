---
pubDatetime: 2022-05-15
title: Monorepo with Turborepo
slug: monorepo-with-turborepo
tags:
  - typescript
  - nextjs
  - monorepo
description: Setting up monorepo with Turborepo to manage all your React, NextJS and Express projects.
---

[🔗 Project's Github address](https://github.com/ogzhanolguncu/monorepo-turborepo)

Imagine having lots of repositories such as React app for the client, Express app for the backend, Storybook and system design repo for sharing and collabrating with developers within the company,
and, maybe a repo for manage utilies. Now, imagine maintaining those repositories individually for at least 2 year. Must sound like a hell of a journey. Jokes aside just thinking about this situation gives me headaches,
I know because we all been there. It gets harder and harder to maintain as the team and repos get larger. Some people heard our agonizing cries and came up with concept called **Monorepo**.

Monorepo is basically single repo with shared configs such as _eslint, tsconfig, prettier_ and consists of other repositories. Pros of this situation is you don't have to manually create
new config files from scratch and extend the base configs if necessary. There aren't may cons to talk about. Pure gold.

There are two major competitors in the Monorepo field, one of them is [Nx](https://nx.dev/) and other one is [Turborepo](https://turborepo.org/). Our focus will be solely on Turborepo.

## Turborepo

Turborepo recently acquired by Vercel and it's going even better since, thanks to Vercel's developer friendly approach. Some benefits of using Turborepo:

- Once built, it will only build what's new
- Caches by default
- Caches on cloud for faster CI/CD builds
- Tasks can depend on eachother. E.g Lint -> Test -> Build -> Deploy. Can change the order with help of _turbo.json_.
- Parallel execution to use all the CPU cores and finish the tasks faster. Not a single core wasted.

![turbo-vs-lerna-execution](/blog-images/monorepo-with-turborepo/turbo-vs-lerna-execution.png)

This image taken from Turborepo's website to show you how powerful Turborepo is. Since **A** and **C** dependent on **B**, **B** first tries to build for other repos to start building meanwhile **A** and **C** doing their own linting and testing.
But in conventional monorepos all the tasks gets executed in parallel, then, after task is completed they start doing the important stuff. Meanwhile all other CPU's in our computers desperately waits.

## Turborepo with React and Express App

We will build a basic Monorepo with Express app for the backend and React for the client. Backend app will return a list of pokemons which will be fetched from [Poke API](https://pokeapi.co/api/v2/pokemon), and React app will return the JSON response to client.
And, finally we will share the type of response between backend and client with the help of Turborepo.

We start off with,

```bash
npx create-turbo@latest
```

Then, we create a folder called _types_ inside _packages_ folder. Then, add the following files.

### index.d.ts

```typescript
export type Pokemon = {
  name: string;
  url: string;
};
export type PokemonList = {
  count: number;
  next: string;
  previous: string | null;
  results: Pokemon[];
};
```

### package.json

```json
{
  "name": "types",
  "version": "0.0.0",
  "main": "./index.tsx",
  "types": "./index.tsx",
  "license": "MIT",
  "scripts": {
    "lint": "eslint *.ts*"
  },
  "devDependencies": {
    "@types/react": "^17.0.37",
    "@types/react-dom": "^17.0.11",
    "eslint": "^7.32.0",
    "eslint-config-custom": "*",
    "react": "^17.0.2",
    "tsconfig": "*",
    "typescript": "^4.5.2"
  }
}
```

### tsconfig.json

```json
{
  "extends": "tsconfig/react-library.json",
  "include": ["."],
  "exclude": ["dist", "build", "node_modules"]
}
```

Now we will be able to use these types across the monorepo.

Let's create our Express app, go ahead and create folder called _pokemon-service_ inside _apps_, then create those files,

### package.json

```json
{
  "name": "pokemon-service",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "start": "node index.js",
    "dev": "ts-node-dev index.ts"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@fastify/cors": "^7.0.0",
    "axios": "^0.27.2",
    "fastify": "^3.29.0",
    "ts-node-dev": "^1.1.8",
    "types": "*"
  },
  "devDependencies": {
    "@types/node": "^17.0.33",
    "tsconfig": "*",
    "typescript": "^4.6.4"
  }
}
```

As you may realize there are dependencies called with **\***, that means those packages are living inside our monorepo and can be shared between apps. This how we will utilize
types between React app and Express app.

### index.ts

```typescript
import { PokemonList } from "types";
import axios from "axios";
import fastify from "fastify";

const server = fastify().register(require("@fastify/cors"));

server.get("/", async (request, reply) => {
  const pokemonList = await axios.get<PokemonList>("https://pokeapi.co/api/v2/pokemon");
  return pokemonList.data.results.map(pokemon => pokemon.name);
});

server.listen(8080, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
```

### tsconfig.json

```json
{
  "extends": "tsconfig/base.json",
  "include": ["."],
  "exclude": ["dist", "build", "node_modules"]
}
```

Finally,

```bash
npm i
```

to install the depedencies.

After we make those changes to our index.ts inside apps/web, we will be able to use our backend service inside next app.

### apps/web/index.ts

```typescript
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Pokemon } from 'types';

export default function Web() {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>();
  useEffect(() => {
    const fetchPokemons = async () => {
      const res = await axios.get('http://127.0.0.1:8080/');
      console.log({ res });
      setPokemonList(res.data);
    };
    fetchPokemons();
  }, []);

  return (
    <div>
      <h1>POKEMON LIST</h1>
      <div>
        {pokemonList?.map((pokemon) => (
          <p key={pokemon.name}>{pokemon}</p>
        ))}
      </div>
    </div>
  );
}
```

Now use

```bash
npm run dev
```

in the root of your project.

## Conclusion

That example repo is small but still proves the benefits of the monorepo. We've shared the types, tsconfigs and eslints with ease, we've added new projects into our monorepo with only
couple of codes. And we get to maintain only one repo for all these projects. Isn't that great? I hope I encourage you to give it a try at Turborepo for your future projects.

[🔗 Project's Github address](https://github.com/ogzhanolguncu/monorepo-turborepo)
