import { getCollection } from "astro:content";
import getSortedPosts from "@utils/getSortedPosts";
import { SITE } from "@config";

export async function GET() {
  const posts = await getCollection("blog");
  const sortedPosts = getSortedPosts(posts);

  const lines = [
    `# ${SITE.title}`,
    "",
    `> ${SITE.desc}`,
    "",
    `Personal site and technical blog by ${SITE.author}. Topics span TypeScript, React, Go, distributed systems, algorithms, and low-level engineering.`,
    "",
    "## Pages",
    "",
    `- [Home](${SITE.website}/)`,
    `- [Blog index](${SITE.website}/blog/)`,
    `- [Tags](${SITE.website}/tags/)`,
    `- [Search](${SITE.website}/search/)`,
    `- [RSS Feed](${SITE.website}/rss.xml)`,
    "",
    "## Posts",
    "",
    ...sortedPosts.map(({ data, slug }) => {
      const desc = data.description ? `: ${data.description}` : "";
      return `- [${data.title}](${SITE.website}/blog/${slug}/)${desc}`;
    }),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
