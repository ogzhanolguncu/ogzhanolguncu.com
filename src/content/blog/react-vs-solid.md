---
pubDatetime: 2021-10-11
title: SolidJS vs React I've Built the Same App On Both Libraries.
slug: react-vs-solid
tags:
  - react
  - typescript
  - tutorial
description: In this article, we will compare SolidJS and React. Benchmark some metrics and assess the pros and cons of both libraries.
---

**SolidJS** has gained lots of popularity lately due to having a close relationship with React.
It has a declarative nature like React, useState and useEffect like hooks, JSX, ContextAPI, Portals, Error Boundaries.
And it gets even better; Solid is much faster in terms of execution and has a lot smaller bundle size.
Because it does not carry the burden of Virtual DOM, which means SolidJS uses real DOM instead.
When your state changes, SolidJS updates only the code that depends on it.

I built the same app with minimal dependencies, **Axios** for fetch requests and **TailwindCSS** for styling. Thanks to core API similarities in both libraries.
Before creating this app, I haven't yet had a chance to try Solid. So, I built the app as if I'm using React. Beware, this article does not aim to teach React, or Solid only tries to point out the differences and similarities in both libraries. Let's get started.

### React

```tsx
const fetchEpisodes = async (optionalUrl?: string) =>
  axios.get<EpisodeResponse>(optionalUrl ?? "https://rickandmortyapi.com/api/episode");

const App: FC = () => {
  const [episodes, setEpisodes] = useState<EpisodeResponse>();
  const [ref, inView] = useInView({ triggerOnce: true });

  const fetchMoreEpisodes = async () => {
    //Fetching episodes with axios
  };

  useEffect(() => {
    if (inView === true) fetchMoreEpisodes();
  }, [fetchMoreEpisodes, inView]);

  useEffect(() => {
    fetchEpisodes().then(res => setEpisodes(res.data));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-10">
      <h2 className=" my-5 text-4xl font-medium">Rick and Morty</h2>
      <div style={{ width: "1000px" }}>
        {episodes?.results.map((episode, index) => (
          <EpisodeWrapper
            episode={episode}
            key={episode.name}
            viewRef={index === episodes.results.length - 1 ? ref : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default App;
```

### Solid

```tsx
const fetchEpisodes = async (optionalUrl?: string) =>
  axios.get<EpisodeResponse>(optionalUrl ?? "https://rickandmortyapi.com/api/episode");

const App: Component = () => {
  const [episodes, setEpisodes] = createSignal<EpisodeResponse>();

  const fetchMoreImages = async () => {
    //Fetching episodes with axios
  };

  const handleScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      fetchMoreImages();
    }
  };

  createEffect(() => {
    window.addEventListener("scroll", handleScroll);
  });

  onMount(async () => {
    setEpisodes((await fetchEpisodes()).data);
  });

  onCleanup(async () => {
    window.removeEventListener("scroll", handleScroll);
  });

  return (
    <div class="flex flex-col items-center justify-center p-10">
      <h2 class=" my-5 text-4xl font-medium">Rick and Morty</h2>
      <div style={{ width: "1000px" }}>
        <For each={episodes()?.results} fallback={<p>Loading...</p>}>
          {episode => (
            <div>
              <EpisodeWrapper episode={episode} />
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

export default App;
```

Apart from some syntactic differences they are pretty much the same. In Solid we use **useSignal** hook instead of **useState** hook. Only difference between these hooks,
in **useState** we can directly call the `episodes`, but in **useSignal** we have to invoke it just like a function, because it's a function. If we are using Typescript
we can give generic type to our signal just like we do in React.

In React we call our API's in `useEffect` to supply inital data for states. But, in Solid we can either call lifecycle method called `onMount` or you can ditch
`onMount` and use `createResource` [hook](https://www.solidjs.com/examples/asyncresource). This hook works like a custom fetch — useFetch — takes a function and returns a promise, loading and error status. But, for the sake of ease
I'll go with `onMount`.

To handle side-effects in Solid we have a hook called `createEffect` this particular hook quite similar to `useEffect` but it has some quirks. Instead of taking dependencies manually
it automatically binds itself to state inside that causes changes. Example:

```tsx
function Counter() {
  const [count, setCount] = createSignal(0);
  const increment = () => setCount(count() + 1);

  createEffect(() => {
    console.log(count()); // Logs count every time it changes
  });
  return (
    <button type="button" onClick={increment}>
      {count()}
    </button>
  );
}
```

Going back to our original example. So, we want to run `handleScroll` each time person scrolls. We create `createEffect` and call our event listener. That's it.
For the return part, in React we generally use map to iterate over the state, but it Solid we have a built in option called `For`. It's actually a component which
receives `each` in our case it's `episodes` state and `fallback` option to show loading or anything you want. And, good part is you don't have to deal with keys
in Solid it automatically handles it for you.

By the way, you can pass props just like you pass props in React everything is the same.

## Benchmarks

Benchmarks criteria will be performance profiling in Chrome Dev Tools and final bundle sizes. Let's start with Performance profiling.
The performance tab shows an overall breakdown of CPU activity into four categories:

- Loading: Making network requests and parsing HTML
- Scripting: Parsing, compiling, and running JavaScript code, also includes Garbage Collection (GC)
- Rendering: Style and layout calculations
- Painting: Painting, compositing, resizing and decoding images

![Function Composition in Javascript](/blog-images/react-vs-solid/compare-two-performance.webp)

The left side is React, and the right is Solid. As you can see Scripting part is almost 3x faster, Rendering almost 2x faster, Painting part is abnormally faster.

If we went down a level deep on the scripting part, we see why.

### React

![react-performance-detail](/blog-images/react-vs-solid/react-performance-detail.webp)

### Solid

![solid-performance-detail](/blog-images/react-vs-solid/solid-performance-details.webp)

React first makes a Function Call which evaluates and commits VDOM into DOM, then makes the XHR calls. Since Solid does not have to deal with VDOM to DOM, it skips that part and starts requests right away.
By the way, if you are wondering about what Functional Call and XHR Load, means you can check this site [Event References](https://developer.chrome.com/docs/devtools/evaluate-performance/performance-reference/).

Bundle sizes of apps:

### React

![react-performance-detail](/blog-images/react-vs-solid/react-bundle.webp)

### Solid

![solid-performance-detail](/blog-images/react-vs-solid/bundle-solid.webp)

## Conclusion

SolidJS definitely doing some things or maybe most of the things better than React, but in my humble opinion, the biggest problem for Solid is the ecosystem. React has an enourmous ecosystem it has components, hooks, patterns for everything.
Think something and try serching that thing in npm, and I bet you will find something regarding your needs. Right now Solid's selling point is being fast. In benchmarks it says
it is quite close to vanilla JS.

It is close to vanilla JS, but we are missing the key thing here. People are not going with React because it is fast, and people even know it isn't.
They are going with React because of the massive community and tooling ecosystem around it.
But I believe that SolidJS has a bright future and, as the community gets bigger and bigger, it'll be even better.
