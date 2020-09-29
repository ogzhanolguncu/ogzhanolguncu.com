import React, { createContext, useState, ReactNode } from 'react';

export const initialState = {
  titleColor: { light: '#343a40', dark: 'white' },
  linkColor: { light: 'blue.500', dark: 'white' },
  linkHoverColor: { light: '#1b1d25', dark: 'orange.300' },
  buttonColor: { light: '#5c7cfa', dark: 'orange.500' },
  buttonHoverColor: { light: '#3b5bdb', dark: 'orange.600' },
  feedBackButtonColor: { light: '#3b5bdb', dark: '#787f87' },
  feedBackButtonBackgroundColor: { light: 'edf2ff', dark: '#edf2ff' },
  articleNewTagBackgroundColor: { light: '#d3f9d8', dark: '#edf2ff' },
  articleNewTagTextColor: { light: '', dark: '#1A202C' },
  articleTagColor: '#f6f8fb',
  white: 'white',
  black: 'black',
  aboutTextColor: { light: '#495057', dark: '#B3B0B1' },
};

//If initial value is a const we specify as  ||| as typeof initialState ||
const ColorModeContext = createContext({} as typeof initialState);

type Props = {
  children?: ReactNode;
};

const CustomColorModeProvider = ({ children }: Props) => {
  const [getColorMode] = useState(initialState);

  return <ColorModeContext.Provider value={getColorMode}>{children}</ColorModeContext.Provider>;
};

export { CustomColorModeProvider, ColorModeContext };
