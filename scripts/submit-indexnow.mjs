#!/usr/bin/env node

/**
 * Submit sitemap URLs to Bing IndexNow after deploy.
 * Usage: npm run indexnow
 * Also submit site at https://www.bing.com/webmasters
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const KEY = "8f3c2a9e1d4b7f6a0c5e8d2b9f1a4c7e";
const HOST = "www.landpricecalculator.com";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sitemap = readFileSync(join(root, "public/sitemap.xml"), "utf8");
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

if (!urlList.length) {
  console.error("No URLs found in sitemap.xml");
  process.exit(1);
}

const payload = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList,
};

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});

if (!response.ok) {
  console.error(`IndexNow failed: ${response.status} ${response.statusText}`);
  process.exit(1);
}

console.log(`IndexNow submitted ${urlList.length} URLs to Bing.`);
