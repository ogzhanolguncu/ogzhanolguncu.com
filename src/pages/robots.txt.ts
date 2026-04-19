import type { APIRoute } from "astro";
import { SITE } from "@config";

const agents = [
  "*",
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "CCBot",
  "Applebot-Extended",
  "Bytespider",
  "DuckAssistBot",
  "Meta-ExternalAgent",
  "Amazonbot",
];

const robots = [
  ...agents.flatMap(agent => [`User-agent: ${agent}`, "Allow: /", ""]),
  `Sitemap: ${new URL("sitemap-index.xml", SITE.website).href}`,
  "",
].join("\n");

export const GET: APIRoute = () =>
  new Response(robots, {
    headers: { "Content-Type": "text/plain" },
  });
