---
pubDatetime: 2021-04-04
title: Handling Logged-in User in React/Firebase App
slug: handling-loggedin-user-firebase-react-app
tags:
  - typescript
  - react
  - tutorial
description: Best way to handle logged-in users in the Firebase/React app is to use custom hook and a context api built with Typescript.
---

Handling logged-in users in a React app is always tricky. But since we are going to be using Firebase to handle our auth, all we need to do is set up a custom React hook and context.
And, we are going to use Typescript during the process to make sure everything is safe and secure. We will start with our custom hook first, then move onto context.

> Sole purpose of this article to cover logged-in users in the Firebase/React app which is why log-in and register phases are not covered.

## useAuthListener

```javascript
import { useState, useEffect } from 'react';

import firebase from 'firebase/app';
import { User } from '@firebase/auth-types';

export default function useAuthListener() {
  const [user, setUser] = useState<User | null>(() =>
    JSON.parse(localStorage.getItem('authUser') || '{}'),
  );

  useEffect(() => {
    const listener = firebase.auth().onAuthStateChanged((authUser) => {
      if (authUser) {
        localStorage.setItem('authUser', JSON.stringify(authUser));
        setUser(authUser);
      } else {
        localStorage.removeItem('authUser');
        setUser(null);
      }
    });

    return () => listener?.();
  }, [firebase]);

  return { user };
}
```

We first define a state which accepts `User` as a type and we lazily initialize it; meaning it'll only run on the first render, and not going to try parsing `localStorage` at each render.
The reason behind this, **IO(Input-Output)** operations are costly and we are trying to minimalize it via lazy-initialization.

Then we are setting up a `useEffect` which listens to auth changes through `onAuthStateChanged`. If a `authUser` exist we'll set localStorage so we can access it later, and of course, we'll set our `setUser`. If there is no `authUser` we'll clear our
`localStorage` and `setUser`. And do not forget to clean up the listener because listening to an event allocates memory and if we don't clean it up, it'll eventually lead to memory leak.
In our case, it's not that important, but it's always best to follow the best practices.

Now, we are ready to use this, but there is one small thing left. We can either use this hook directly in our components or set up a new context to pass down our logged-in user.
I'll cover setting up a context because it feels more convenient than calling the same hook over and over again. In the end, thats why `Context API` exists.

## User Context

```typescript
import { createContext } from "react";
import { User } from "@firebase/auth-types";

type ContextType = {
  user: User | null;
};

const UserContext = createContext<ContextType | null>(null);
export default UserContext;
```

Nothing special here we've just given type to our context.

## App

```javascript
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import PrivateRoute from "components/private-route";

import * as ROUTES from "constants/routes";
import UserContext from "contexts/userContext";
import useAuthListener from "hooks/use-auth-listener";

function App() {
  const { user } = useAuthListener();

  return (
    <UserContext.Provider value={{ user }}>
      <Router>
        <Switch>
          <PrivateRoute user={user} path={ROUTES.BOARDS} exact>
            <Boards />
          </PrivateRoute>
          <Route component={NotFound} />
        </Switch>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
```

Now, everything inside our `app.tsx` can access firebase `user` through `UserContext`.

### For example:

```javascript
import UserContext from "contexts/userContext";

const NavbarRight = () => {
  const user = useContext(UserContext)?.user;

  return <>{user?.displayName}</>;
};

export default NavbarRight;
```

You see how easy it is to manage logged-in user in a Firebase app built with React and Typescript. And, I hope encouraged you to use custom hooks and context for that matter.
