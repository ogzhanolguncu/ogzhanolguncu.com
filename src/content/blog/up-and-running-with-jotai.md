---
pubDatetime: 2022-06-18
title: Up & Running with Jotai, Typescript and NextJS
slug: up-and-running-with-jotai
tags:
  - typescript
  - tutorial
  - react
  - nextjs
  - jotai
description: Simple, elegant state management with Jotai and type-safety with Typescript. Today we will learn how to use them together.
---

Ever wanted a state management library that felt like you were using useState? If so, [Jotai](https://jotai.org/) is here to help you. Jotai is a state management library
based on atoms similar to Facebook's [Recoil](https://jotai.org/).

Jotai allows you to compose atoms, derive from other atoms, sync with localStorage, and, even allows you to hydrate your atoms, where an initial value comes from server.
Incredibly useful for Frameworks like Remix and NextJS to pass data to state management right after the hydration without worrying about rerenders.

If your app already using Context API and you are looking for a more elegant and less verbose approach, Jotai is definitely the state management library you need.

Let's not waste any more time and dive into it.

Here is the app we are going to build together. A simple NextJS app where we add, delete and update items from the list and show the count of the items at the.

### Working Example

[🔗Project's Github address](https://github.com/ogzhanolguncu/jotai-cat-factory)

<CodeSandBox
src={
'https://codesandbox.io/embed/up-and-running-with-jotai-7iffpx?autoresize=1&fontsize=14&hidenavigation=1&theme=dark&view=preview'
}
title={'Jotai NexJS Typescript example'}
/>

We will start off bootstrapping our NextJS project with:

```bash
npx create-next-app@latest --ts
```

Which will give us latest version of NextJS, React and Typescript so we can easily get started. And, we will add [Chakra UI](https://chakra-ui.com/guides/getting-started/nextjs-guide) for styling
and of course Jotai for the state management.

```bash
npm i @chakra-ui/react @emotion/react@^11 @emotion/styled@^11 framer-motion@^6 nanoid jotai
```

After the installation completed, we need to create an atoms folder in our root directory and add the atoms that we are going to use.

```typescript
import { atom } from "jotai";
import { nanoid } from "nanoid";

type CatType = {
  name: string;
  age: string;
  id: string;
};

const catList = [
  {
    name: "Snowball",
    age: "3",
    id: nanoid(),
  },
  {
    name: "Cotton",
    age: "2",
    id: nanoid(),
  },
  {
    name: "Purrfect",
    age: "1",
    id: nanoid(),
  },
  {
    name: "Garfield",
    age: "1",
    id: nanoid(),
  },
];

export const catAtom = atom(catList);
export const updatedCat = atom<CatType | null>(null);
export const catLengthAtom = atom(get => get(catAtom).length);
```

We are pretty much done with our atoms. It's dead simple, but don't let simplicity trick you Jotai is incredibly heuristic. Just as we talked earlier, usage is pretty similar to useState, but in Jotai atoms can depend on each other and
derive values once dependent atoms changes.

Unlike useState/useContext, Jotai smart enough to understand if component wants to render or not.
That way it can avoid unnecessary component updates - when parent get updated all the children get updated as well.

Let's get back to building our simple app.

### App.tsx

```typescript
import { catLengthAtom } from '../atoms/index';

const Navbar = () => {
  return (
    <Flex w="100%" justifyContent="center" my="2rem">
      <Flex
        gap="5rem"
        border="3px solid #bcadad5e"
        boxShadow="8px 8px #8876765e"
        borderRadius="10px"
        padding="1rem"
      >
        <NextLink passHref href="/" shallow>
          <Link fontSize="3xl">LIST</Link>
        </NextLink>
        <NextLink passHref href="/add-cat" shallow>
          <Link fontSize="3xl">ADD A CAT</Link>
        </NextLink>
      </Flex>
    </Flex>
  );
};

const CatCounter = () => {
  const [catLength] = useAtom(catLengthAtom);

  return (
    <Box fontSize="xl" fontWeight="bold" color="gray.800" maxW="300px" marginLeft="1rem">
      <Text
        border="3px solid #bcadad5e"
        boxShadow="8px 8px #8876765e"
        borderRadius="10px"
        padding="1rem"
      >
        Cat Count: {catLength}
      </Text>
    </Box>
  );
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Center width="100%" flexDirection="column">
        <CatCounter />
        <Navbar />
        <Component {...pageProps} />
      </Center>
    </ChakraProvider>
  );
}
```

> We use `shallow` for NextJS links to keep previous states otherwise they get eliminated by SSR. If shallow is enabled NextJS will navigate back without SSR. Useful for avoid data fetching if not necessary.

In our `CatCounter` component, we call our `catLengthAtom` as if we are using useState. Once the cat size changes it gets updated

```typescript
export const catLengthAtom = atom(get => get(catAtom).length);
```

Reason is, catLengthAtom always tracking the state of catAtom - deriving value from `catAtom` similar to this:

```typescript
const [catArray, setCatArray] = useState<{ catArray: someCatType }>(catArray);
const catLength = catArray.length;
```

This is how you usually derive a value in React, but catLength always need to access catArray or need to close to it. In Jotai we can use `get(someAtom)` and derive from it.

Now, we will change the `index.tsx` and add those codes in it.

### index.tsx

```typescript
export default function Home() {
  const router = useRouter();

  const [catList, updateCat] = useAtom(catAtom);
  const [_, updatedCatInfo] = useAtom(updatedCat);

  const handleCatDelete = (id: string) =>
    updateCat((prevState) => prevState.filter((cat) => cat.id !== id));

  const handleCatUpdate = (id: string) => {
    const selectedCat = catList.find((cat) => cat.id === id);
    if (selectedCat) updatedCatInfo(selectedCat);
    router.push('/add-cat');
  };

  return (
    <Flex
      direction="column"
      border="3px solid #bcadad5e"
      boxShadow="8px 8px #8876765e"
      borderRadius="10px"
      padding="3rem"
    >
      <Heading fontSize="3xl">CAT LIST</Heading>
      <Flex direction="column" gap="2rem">
        {catList.map((cat) => (
          <Flex
            key={cat.id}
            alignItems="center"
            gap="2rem"
            mt="2rem"
            border="3px solid #bcadad5e"
            boxShadow="8px 8px #8876765e"
            borderRadius="10px"
            padding="1rem"
          >
            <Flex direction="column">
              <Flex fontSize="xl" gap="0.5rem">
                <Text>Name:</Text>
                <Text fontWeight="bold">{cat.name}</Text>
              </Flex>
              <Flex fontSize="xl" gap="0.5rem">
                <Text>Age:</Text>
                <Text fontWeight="bold">{cat.age}</Text>
              </Flex>
            </Flex>
            <IconButton
              onClick={() => handleCatDelete(cat.id)}
              aria-label="Delete a cat"
              icon={<DeleteIcon w={6} h={6} />}
            />
            <IconButton
              onClick={() => handleCatUpdate(cat.id)}
              aria-label="Edit a cat"
              icon={<EditIcon w={6} h={6} />}
            />
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
}
```

Just like useState huh?

```typescript
const [catList, updateCat] = useAtom(catAtom);
```

This usage allow us to get the list of the current list, and add or delete to/from the list.

We can even access the prevState as if we are using useState. I know I'm saying '_as if we are using useState_' but I want everyone to appreciate this simplicity.

```typescript
updateCat(prevState => prevState.filter(cat => cat.id !== id));
```

We got one last thing to do. We will add a new page for adding/editing cats into the array.

### add-cat.tsx

```typescript
export default function AddCat() {
  const router = useRouter();
  const [_, updateCat] = useAtom(catAtom);
  const [updatedCatInfo, setUpdatedCatInfo] = useAtom(updatedCat);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  const isUpdate = Boolean(updatedCatInfo);

  useEffect(() => {
    if (updatedCatInfo) {
      setName(updatedCatInfo?.name);
      setAge(updatedCatInfo?.age);
    }
  }, [updatedCatInfo]);

  const handleAddCat = () => {
    updateCat((prevState) => [
      ...prevState,
      {
        age,
        name,
        id: nanoid(),
      },
    ]);
    router.push('/');
  };

  const handleEditCat = () => {
    updateCat((prevState) => [
      ...prevState.map((cat) => (cat.id === updatedCatInfo?.id ? { ...cat, name, age } : cat)),
    ]);
    router.push('/');
    setUpdatedCatInfo(null);
  };

  const isUpdateFunction = () => (isUpdate ? handleEditCat() : handleAddCat());

  return (
    <Flex
      direction="column"
      border="3px solid #bcadad5e"
      boxShadow="8px 8px #8876765e"
      borderRadius="10px"
      padding="3rem"
    >
      <Heading fontSize="3xl">ADD A CAT</Heading>
      <Flex flexDirection="column" mt="2rem" gap="2rem">
        <Input
          value={name}
          variant="outline"
          placeholder="Name"
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <Input
          value={age}
          variant="outline"
          placeholder="Age"
          onChange={(e) => setAge(e.currentTarget.value)}
        />
        <Button variant="outline" onClick={isUpdateFunction}>
          Submit
        </Button>
      </Flex>
    </Flex>
  );
}
```

If `updatedCatInfo` is not null we edit the cat if it's not we create a new cat instead.

```typescript
const isUpdateFunction = () => (isUpdate ? handleEditCat() : handleAddCat());
```

To edit, we use this neat trick. Mapping over prevState, and if we can find the cat id we change it's values by spreading and writing them if not there just returning the cat untouched.

```typescript
updateCat(prevState => [
  ...prevState.map(cat => (cat.id === updatedCatInfo?.id ? { ...cat, name, age } : cat)),
]);
```

To add, we just spread the rest of the cats and add new cat to the end.

```typescript
updateCat(prevState => [
  ...prevState,
  {
    age,
    name,
    id: nanoid(),
  },
]);
```

We now have a cat factory. Enjoy playing around.

## Conclusion

- Jotai has a very shallow learning curve
- Jotai gives us React like API
- Jotai heuristic enough to know when to render
- Jotai allows us to compose atoms and derive from each other
- Jotai supports SSR and has a util for localStorage
