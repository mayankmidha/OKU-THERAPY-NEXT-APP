import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { load } from "cheerio";

const BASE_URL = "https://okutherapy.com";
const PAGE_ROUTES = [
  { slug: "home", path: "/", pageId: 13 },
  { slug: "about-us", path: "/about-us/", pageId: 453 },
  { slug: "people", path: "/people/", pageId: 426 },
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const CONTENT_DIR = path.join(ROOT, "content", "generated");
const STYLE_DIR = path.join(ROOT, "app", "styles", "generated");

const downloaded = new Set();
const downloadedCss = new Set();

async function ensureDir(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

function cleanFileUrl(rawUrl) {
  const url = new URL(rawUrl);
  url.search = "";
  url.hash = "";
  return url.toString();
}

function toLocalPath(rawUrl) {
  const url = new URL(rawUrl);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith("/")) {
    pathname = `${pathname}index.html`;
  }
  return path.join(PUBLIC_DIR, pathname.replace(/^\//, ""));
}

function isWpHost(rawUrl) {
  const url = new URL(rawUrl);
  return url.host === new URL(BASE_URL).host;
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "okutherapy-next-migration-bot/1.0 (+https://okutherapy.com)",
    },
  });
  if (!res.ok) {
    throw new Error(`Failed ${url}: HTTP ${res.status}`);
  }
  return res.text();
}

async function downloadBinary(url) {
  const normalized = cleanFileUrl(url).replace(
    /(\.(png|jpe?g|gif|webp|svg|woff2?|ttf|eot|mp4))\/$/i,
    "$1",
  );
  if (downloaded.has(normalized)) {
    return;
  }
  downloaded.add(normalized);

  const res = await fetch(normalized, {
    headers: {
      "user-agent":
        "okutherapy-next-migration-bot/1.0 (+https://okutherapy.com)",
    },
  });
  if (!res.ok) {
    console.warn(`[sync:wp] Skipping missing asset ${normalized} (${res.status})`);
    return;
  }

  const arrayBuffer = await res.arrayBuffer();
  const localPath = toLocalPath(normalized);
  await ensureDir(localPath);
  await writeFile(localPath, Buffer.from(arrayBuffer));
}

function extractCssUrls(cssText, cssUrl) {
  const found = [];
  const urlPattern = /url\(([^)]+)\)/g;
  let match = urlPattern.exec(cssText);

  while (match) {
    const raw = match[1].trim().replace(/^['"]|['"]$/g, "");
    if (raw && !raw.startsWith("data:")) {
      const resolved = new URL(raw, cssUrl).toString();
      found.push(resolved);
    }
    match = urlPattern.exec(cssText);
  }

  return found;
}

async function downloadCss(url) {
  const normalized = cleanFileUrl(url);
  if (downloadedCss.has(normalized)) {
    return;
  }
  downloadedCss.add(normalized);

  let cssText = "";
  try {
    cssText = await fetchText(normalized);
  } catch (error) {
    console.warn(`[sync:wp] Skipping stylesheet ${normalized}: ${error.message}`);
    return;
  }
  const localPath = toLocalPath(normalized);
  await ensureDir(localPath);
  await writeFile(localPath, cssText, "utf8");

  const nestedAssets = extractCssUrls(cssText, normalized);
  for (const assetUrl of nestedAssets) {
    if (!isWpHost(assetUrl)) {
      continue;
    }
    await downloadBinary(assetUrl);
  }
}

function extractUploadUrls(...chunks) {
  const urls = new Set();
  const patterns = [
    /https:\/\/okutherapy\.com\/wp-content\/uploads\/[^"'\s<)&]+/g,
    /https:\\\/\\\/okutherapy\.com\\\/wp-content\\\/uploads\\\/[^"'\s<)&]+/g,
  ];

  for (const chunk of chunks) {
    for (const pattern of patterns) {
      let match = pattern.exec(chunk);
      while (match) {
        const normalized = match[0]
          .replace(/\\\//g, "/")
          .replace(/&#038;/g, "&");
        urls.add(normalized);
        match = pattern.exec(chunk);
      }
    }
  }

  return [...urls];
}

function sanitizeHtml(rawHtml) {
  return rawHtml
    .replace(
      /(xlink:href|href|src)=["']data:image[^"']+["']/gi,
      (_match, attr) => `${attr}=""`,
    )
    .replace(/\s{2,}/g, " ");
}

function writePrettyJson(filePath, value) {
  return writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}

function getBodyClassFromHtml(html) {
  const match = html.match(/<body class="([^"]+)"/);
  return match ? match[1] : "";
}

function extractStyleText($, selector) {
  const node = $(selector).first();
  if (!node.length) {
    return "";
  }
  return node.html() ?? "";
}

function extractOceanInlineStyle($) {
  const styles = $("style[type='text/css']").toArray();
  for (const style of styles) {
    const text = $(style).html() ?? "";
    if (text.includes("OceanWP Style Settings CSS")) {
      return text;
    }
  }
  return "";
}

async function main() {
  await mkdir(CONTENT_DIR, { recursive: true });
  await mkdir(STYLE_DIR, { recursive: true });

  const routeData = {};
  const stylesheetUrls = new Set();
  const fullHtmlBySlug = {};
  const wpJsonBySlug = {};

  for (const route of PAGE_ROUTES) {
    const pageUrl = new URL(route.path, BASE_URL).toString();
    const fullHtml = await fetchText(pageUrl);
    const wpJson = await fetchText(
      `${BASE_URL}/wp-json/wp/v2/pages/${route.pageId}?_fields=id,slug,title,modified,content,yoast_head_json`,
    );

    fullHtmlBySlug[route.slug] = fullHtml;
    wpJsonBySlug[route.slug] = JSON.parse(wpJson);

    const sanitizedFullHtml = sanitizeHtml(fullHtml);
    const sanitizedPageHtml = sanitizeHtml(
      wpJsonBySlug[route.slug].content.rendered,
    );

    await writeFile(
      path.join(CONTENT_DIR, `${route.slug}.full.html`),
      sanitizedFullHtml,
      "utf8",
    );
    await writeFile(path.join(CONTENT_DIR, `${route.slug}.json`), wpJson, "utf8");
    await writeFile(
      path.join(CONTENT_DIR, `${route.slug}.page.html`),
      sanitizedPageHtml,
      "utf8",
    );

    const $ = load(sanitizedFullHtml);
    const header = sanitizeHtml($("#site-header").first().prop("outerHTML") ?? "");
    await writeFile(
      path.join(CONTENT_DIR, `${route.slug}.header.html`),
      header,
      "utf8",
    );

    $("link[rel='stylesheet']").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) {
        return;
      }
      const resolved = new URL(href, BASE_URL).toString();
      if (isWpHost(resolved)) {
        stylesheetUrls.add(resolved);
      }
    });

    routeData[route.slug] = {
      slug: route.slug,
      path: route.path,
      pageId: route.pageId,
      bodyClass: getBodyClassFromHtml(fullHtml),
      yoast: wpJsonBySlug[route.slug].yoast_head_json,
      title: wpJsonBySlug[route.slug].title?.rendered ?? "",
      modified: wpJsonBySlug[route.slug].modified,
    };
  }

  const homeHtml = fullHtmlBySlug.home;
  const home$ = load(homeHtml);
  const footerHtml = sanitizeHtml(
    home$("div.elementor-location-footer").first().prop("outerHTML") ?? "",
  );
  const popupHtml = home$("div.elementor-location-popup")
    .toArray()
    .map((node) => sanitizeHtml(home$(node).prop("outerHTML") ?? ""))
    .join("\n");

  await writeFile(path.join(CONTENT_DIR, "footer.html"), footerHtml, "utf8");
  await writeFile(path.join(CONTENT_DIR, "popups.html"), popupHtml, "utf8");

  const generatedStyles = {
    "global-styles.css": extractStyleText(home$, "style#global-styles-inline-css"),
    "classic-theme-styles.css": extractStyleText(
      home$,
      "style#classic-theme-styles-inline-css",
    ),
    "wp-emoji-styles.css": extractStyleText(home$, "style#wp-emoji-styles-inline-css"),
    "wp-custom.css": extractStyleText(home$, "style#wp-custom-css"),
    "ocean-inline.css": extractOceanInlineStyle(home$),
  };

  for (const [fileName, cssText] of Object.entries(generatedStyles)) {
    await writeFile(path.join(STYLE_DIR, fileName), cssText, "utf8");
  }

  await writePrettyJson(path.join(CONTENT_DIR, "routes.json"), routeData);

  for (const cssUrl of [...stylesheetUrls]) {
    await downloadCss(cssUrl);
  }

  const uploadUrls = extractUploadUrls(
    ...Object.values(fullHtmlBySlug),
    ...Object.values(wpJsonBySlug).map((data) => JSON.stringify(data)),
  );

  for (const uploadUrl of uploadUrls) {
    await downloadBinary(uploadUrl);
  }

  // Copy robots and sitemap index for baseline parity references.
  const robots = await fetchText(`${BASE_URL}/robots.txt`);
  await writeFile(path.join(CONTENT_DIR, "robots.txt"), robots, "utf8");

  const sitemapIndex = await fetchText(`${BASE_URL}/sitemap_index.xml`);
  await writeFile(path.join(CONTENT_DIR, "sitemap_index.xml"), sitemapIndex, "utf8");

  // Persist lists for auditing.
  await writePrettyJson(path.join(CONTENT_DIR, "stylesheets.json"), [
    ...stylesheetUrls,
  ]);
  await writePrettyJson(path.join(CONTENT_DIR, "upload-assets.json"), uploadUrls);

  // Keep a light manifest for local CSS links.
  const localCssLinks = [...stylesheetUrls]
    .map((url) => new URL(cleanFileUrl(url)).pathname)
    .sort();
  await writePrettyJson(path.join(CONTENT_DIR, "local-css-paths.json"), localCssLinks);

  console.log(
    `Synced ${PAGE_ROUTES.length} pages, ${stylesheetUrls.size} CSS files, ${uploadUrls.length} uploaded assets.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
