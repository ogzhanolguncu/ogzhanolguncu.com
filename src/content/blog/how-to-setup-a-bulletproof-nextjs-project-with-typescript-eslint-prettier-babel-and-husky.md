---
pubDatetime: 2020-12-06
title: How to Setup a Bulletproof Next.js Project with Typescript, ESLint, Prettier, Babel and Husky
slug: how-to-setup-a-bulletproof-nextjs-project-with-typescript-eslint-prettier-babel-and-husky
tags:
  - typescript
  - react
  - tutorial
  - nextjs
description: In order to make your Next.js project robust and maintainable, you should be using ESLint, Typescript, Husky and Prettier.
---

There is only one way to make sure you have consistent code across developers;
you need to setup a well structured base project with **_ESLint_** to enforce rules, **_Prettier_** to be sure all the codes consistently formatted, **_Typescript_** to have type-safety
and of course **_Husky_** to run automated tasks during commiting and pushing code via hooks. So, lets get started.

So, we start by creating our project.

```bash
npx create-next-app nextjs-blog
```

Then we add `tsconfig.json` into our **src** and those configs in.

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@components/*": ["./components/*"],
      "@contexts/*": ["./contexts/*"]
    },
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve"
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

I'm not going to go into details of these configs, but if we include `strict`, Typescript will enforce lots of things such as **strict null checks**, **no implicit any**,
**no implicit this**, etc. You can pretty much configure all the options. Check here for more detailed version of the configuration [What is a tsconfig.json](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html).

So, after we added `tsconfig.json`, if we type `yarn dev`, Next.js will throw something like this `yarn add --dev typescript @types/react @types/node`. Typescript requires types to run, so we add them into
our **devDependencies** by typing `--dev`. By the way, `--dev` represents development dependencies, they are not going part of our final build when we push the code into production.

## Time to get pretty

We start with `prettier`, since this is the easiest one to setup up. We add file `.prettierrc` into our **src** directory. Then we add these configs.

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

## ESLint

This one is little tough. We, first create a `.eslintrc.json` in our **src** directory, then we need to add our ESLint settings.

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "settings": {
    "react": {
      "version": "detect" // Tells eslint-plugin-react to automatically detect the version of React to use
    }
  },

  "plugins": ["@typescript-eslint", "prettier"],
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "prettier/@typescript-eslint"
  ],
  "env": {
    "es6": true,
    "browser": true,
    "jest": true,
    "node": true
  },
  "rules": {
    "react/react-in-jsx-scope": 0,
    "react/display-name": 0,
    "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/explicit-module-boundary-types": 0,
    "@typescript-eslint/explicit-member-accessibility": 0,
    "@typescript-eslint/indent": 0,
    "@typescript-eslint/member-delimiter-style": 0,
    "@typescript-eslint/no-var-requires": 0,
    "@typescript-eslint/no-use-before-define": 0,
    "@typescript-eslint/ban-ts-ignore": ["off"],
    "@typescript-eslint/no-unescaped-entities": 0,
    "react/no-unescaped-entities": 0,
    "quotes": ["error", "single", { "allowTemplateLiterals": true }],
    "object-curly-spacing": ["error", "always"],
    "no-empty-pattern": ["off"],
    "no-undef": ["error"],
    "no-var": ["error"],
    "@typescript-eslint/no-unused-vars": [
      2,
      {
        "argsIgnorePattern": "^_"
      }
    ],
    "no-console": [
      2,
      {
        "allow": ["warn", "error"]
      }
    ]
  }
}
```

ESLint requires some additional npm packages to get running.
Type `yarn add --dev @typescript-eslint/eslint-plugin @typescript-eslint/parser` `eslint eslint-config-prettier eslint-plugin-prettier eslint-plugin-react`
`prettier babel-plugin-module-resolver`. Now, all you have to do is enabling your ESLint. If you are using **vscode** simply download ESLint extension, and you are ready to go.

## Babel

Babel compiles your ES6 code into an older version of Javascript, so older browsers can understand it as well. And, since Typescript has taken care of this we don't really need Babel, but the sake of demonstration
we will setup a really basic Babel. Create a file called `.babelrc` in your **src** directory and add these configs.

```json
{
  "presets": [["next/babel"]],
  "plugins": [
    [
      "module-resolver",
      {
        "root": ["./"],
        "alias": {
          "@components": "./components",
          "@contexts": "./contexts"
        }
      }
    ]
  ]
}
```

You can now import your components using `@components` like this `import { Layout } from '@components/index';` and, since we added root path we specificy import files from our **src**.
For this we need a package called module resolver, let's add it by typing `yarn add --dev babel-plugin-module-resolver`.

Time to combine all of this.

## Husky

Husky let us run a predefined set of commands before we commit or push our code, and these are called **_hooks_**. Before we dive into hooks, let's first install the dependencies.
Type `yarn add --dev lint-staged husky`. By the way, setting Husky up is actually pretty simple, just add these configs into your `

```json
"scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "format": "prettier --write \"**/*.{js,ts,tsx}\"",
    "type-check": "tsc --pretty --noEmit",
    "lint": "eslint . --ext ts --ext tsx --ext js"
  },
  "lint-staged": {
    "*.@(ts|tsx)": [
      "yarn lint",
      "yarn format"
    ]
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "yarn run type-check"
    }
  }
```

And, we are ready to go. Now, whenever we commit or push our code into git our linter gonna check if there are any errors and then prettier gonna format our code
and finally, typescript gonna run type check to see if there are any faulty types.
