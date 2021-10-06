import { Feed } from 'feed';
import fs from 'fs';
import { StaticBlog } from 'global';

export const generateRssFeed = async (posts: StaticBlog[]) => {
  const siteURL = 'https://ogzhanolguncu.com';
  const date = new Date();
  const author = {
    name: 'Oguzhan Olguncu',
    email: 'ogzhan11@gmail.com',
  };

  const feed = new Feed({
    title: 'Articles by Oguzhan Olguncu',
    description: '',
    id: siteURL,
    link: siteURL,
    image: `${siteURL}/logo.svg`,
    favicon: `${siteURL}/favicon.png`,
    copyright: `All rights reserved ${date.getFullYear()}, Oguzhan Olguncu`,
    updated: date,
    generator: 'Feed for Node.js',
    feedLinks: {
      rss2: `${siteURL}/rss/feed.xml`,
      json: `${siteURL}/rss/feed.json`,
      atom: `${siteURL}/rss/atom.xml`,
    },
    language: 'en-us',
    author,
  });

  posts.forEach((post) => {
    const url = `${siteURL}/blog/${post.id}`;

    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.summary,
      content: post.summary,
      author: [author],
      contributor: [author],
      date: new Date(post.publishedAt),
      published: new Date(post.publishedAt),
      category: [
        {
          domain: 'Web development/Javascript/Typescript',
          name: post.languageTags.map((x) => x).join(','),
        },
      ],
      image: `${siteURL}${post.image}`,
    });
  });

  fs.mkdirSync('./public/rss', { recursive: true });
  fs.writeFileSync('./public/rss/feed.xml', feed.rss2());
  fs.writeFileSync('./public/rss/atom.xml', feed.atom1());
  fs.writeFileSync('./public/rss/feed.json', feed.json1());
};
