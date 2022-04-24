import { useState } from 'react';

const useToggle = (initialState = false) => {
  const [toggle, setToggle] = useState(initialState);

  const toggleState = (state?: false | true) => {
    setToggle(typeof state === 'boolean' ? state : !toggle);
  };
  return [toggle, toggleState] as const;
};

export default useToggle;
