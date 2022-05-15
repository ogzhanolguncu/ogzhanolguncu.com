export const randomColors = [
  '#d11a1a78',
  '#0000ff8f',
  'purple.400',
  'green.400',
  'pink.400',
  'teal.400',
  '#ed8936d6',
];

export const pickRandomColor = () => {
  const randomNumber = Math.floor(Math.random() * 7);
  return randomColors[randomNumber];
};

export const LANGUAGE_TAGS: Record<string, string> = {
  javascript: '',
  typescript: '',
  api: '',
  asynchronous: '',
  redux: '',
  react: '',
  tutorial: '',
  flutter: '',
  design: '',
  html: '',
  nodejs: '',
  ssr: '',
  css: '',
  computerscience: '',
  testing: '',
  webpack: '',
  optimization: '',
  microfrontend: '',
  functional_programming: '',
  solidity: '',
  nextjs: '',
  monorepo: '',
};

export const languageColorizer = () => {
  const languageTags = { ...LANGUAGE_TAGS };
  for (const tag in languageTags) {
    languageTags[tag] = pickRandomColor();
  }
  return languageTags;
};
