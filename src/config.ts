import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://ogzhanolguncu.com",
  author: "Oguzhan Olguncu",
  desc: "A developer who likes to hack things up. Dedicated learner, mentor and technical blogger - Oğuzhan Olguncu",
  title: "Oğuzhan Olguncu",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerPage: 10,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
};

export const LOCALE = {
  lang: "en",
  langTag: ["en-EN"],
} as const;

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/ogzhanolguncu",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/ogzhanolguncu/",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:ogzhan11@gmail.com",
    linkTitle: `Send an email to ${SITE.title}`,
    active: true,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/hezarfendd",
    linkTitle: `${SITE.title} on Twitter`,
    active: true,
  },
];
