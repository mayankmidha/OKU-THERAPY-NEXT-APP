import { readFileSync } from "node:fs";
import path from "node:path";

import { load } from "cheerio";
import type { Metadata } from "next";

import routesJson from "@/content/generated/routes.json";
import stylesheetsJson from "@/content/generated/stylesheets.json";

export type RouteSlug = "home" | "about-us" | "people";

type YoastImage = {
  height?: number;
  type?: string;
  url: string;
  width?: number;
};

type YoastRobots = {
  follow?: string;
  index?: string;
  "max-image-preview"?: string;
  "max-snippet"?: string;
  "max-video-preview"?: string;
};

type YoastData = {
  article_modified_time?: string;
  canonical?: string;
  og_description?: string;
  og_image?: YoastImage[];
  og_locale?: string;
  og_site_name?: string;
  og_title?: string;
  og_type?: string;
  og_url?: string;
  robots?: YoastRobots;
  schema?: Record<string, unknown>;
  title?: string;
  twitter_card?: string;
  twitter_misc?: Record<string, string>;
};

type WpRouteRecord = {
  bodyClass: string;
  modified: string;
  pageId: number;
  path: string;
  slug: RouteSlug;
  title: string;
  yoast?: YoastData;
};

export type PopupEntry = {
  html: string;
  id: string;
};

const GENERATED_DIR = path.join(process.cwd(), "content", "generated");
const GENERATED_STYLES_DIR = path.join(
  process.cwd(),
  "app",
  "styles",
  "generated",
);
const SITE_ORIGINS = [
  "https://okutherapy.com",
  "http://okutherapy.com",
  "https://www.okutherapy.com",
  "http://www.okutherapy.com",
];

const ROUTES = routesJson as Record<RouteSlug, WpRouteRecord>;
const STYLESHEETS = stylesheetsJson as string[];
const htmlCache = new Map<string, string>();
const styleCache = new Map<string, string>();

let popupEntriesCache: PopupEntry[] | null = null;

function readGeneratedFile(fileName: string): string {
  const cached = htmlCache.get(fileName);
  if (cached) {
    return cached;
  }

  const content = readFileSync(path.join(GENERATED_DIR, fileName), "utf8");
  const normalized = normalizeExtractedHtml(content);
  htmlCache.set(fileName, normalized);
  return normalized;
}

function readGeneratedStyleFile(fileName: string): string {
  const cached = styleCache.get(fileName);
  if (typeof cached === "string") {
    return cached;
  }

  const content = readFileSync(path.join(GENERATED_STYLES_DIR, fileName), "utf8");
  styleCache.set(fileName, content);
  return content;
}

function normalizeExtractedHtml(rawHtml: string): string {
  let normalized = rawHtml;

  for (const origin of SITE_ORIGINS) {
    normalized = normalized.replaceAll(`href="${origin}"`, 'href="/"');
    normalized = normalized.replaceAll(`href='${origin}'`, "href='/'");
  }

  for (const origin of SITE_ORIGINS) {
    normalized = normalized.split(origin).join("");
    normalized = normalized
      .split(origin.replaceAll("/", "\\/"))
      .join("");
  }

  normalized = normalized.replaceAll("&#038;", "&");
  return normalized;
}

function normalizePathname(pathname: string): string {
  const clean = pathname.split("?")[0].split("#")[0] || "/";
  if (clean === "/") {
    return "/";
  }
  return clean.endsWith("/") ? clean : `${clean}/`;
}

function getSlugForPathname(pathname: string): RouteSlug {
  const normalized = normalizePathname(pathname);

  for (const slug of Object.keys(ROUTES) as RouteSlug[]) {
    const routePath = ROUTES[slug].path;
    if (normalized === routePath || normalized === routePath.slice(0, -1)) {
      return slug;
    }
  }

  return "home";
}

function getGeneratedPageFile(slug: RouteSlug): string {
  return readGeneratedFile(`${slug}.page.html`);
}

function getGeneratedHeaderFile(slug: RouteSlug): string {
  return readGeneratedFile(`${slug}.header.html`);
}

export function getWpRoute(slug: RouteSlug): WpRouteRecord {
  return ROUTES[slug];
}

export function getBodyClassForPathname(pathname: string): string {
  const slug = getSlugForPathname(pathname);
  return ROUTES[slug].bodyClass;
}

export function getHeaderHtml(slug: RouteSlug): string {
  return getGeneratedHeaderFile(slug);
}

export function getPageHtml(slug: RouteSlug): string {
  return getGeneratedPageFile(slug);
}

export function getFooterHtml(): string {
  return readGeneratedFile("footer.html");
}

export function getPopupEntries(): PopupEntry[] {
  if (popupEntriesCache) {
    return popupEntriesCache;
  }

  const $ = load(readGeneratedFile("popups.html"));
  const entries: PopupEntry[] = [];

  $("div[data-elementor-type='popup']").each((_, node) => {
    const popup = $(node);
    const id = popup.attr("data-elementor-id");
    if (!id) {
      return;
    }

    popup.removeAttr("data-elementor-type");
    popup.removeAttr("data-elementor-post-type");

    entries.push({
      id,
      html: $.html(popup) ?? "",
    });
  });

  popupEntriesCache = entries;
  return entries;
}

export function getSchemaJson(slug: RouteSlug): string | null {
  const schema = ROUTES[slug].yoast?.schema;
  if (!schema) {
    return null;
  }
  return JSON.stringify(schema);
}

export function getLocalStylesheetPaths(): string[] {
  return STYLESHEETS.map((stylesheet) => {
    try {
      return new URL(stylesheet).pathname;
    } catch {
      return stylesheet.split("?")[0];
    }
  });
}

export type InlineStyleBlock = {
  cssText: string;
  id?: string;
};

export function getPreStylesheetInlineStyles(): InlineStyleBlock[] {
  return [
    {
      cssText: readGeneratedStyleFile("wp-emoji-styles.css"),
      id: "wp-emoji-styles-inline-css",
    },
    {
      cssText: readGeneratedStyleFile("classic-theme-styles.css"),
      id: "classic-theme-styles-inline-css",
    },
    {
      cssText: readGeneratedStyleFile("global-styles.css"),
      id: "global-styles-inline-css",
    },
  ].filter((entry) => entry.cssText.trim().length > 0);
}

export function getPostStylesheetInlineStyles(): InlineStyleBlock[] {
  return [
    {
      cssText: readGeneratedStyleFile("wp-custom.css"),
      id: "wp-custom-css",
    },
    {
      cssText: readGeneratedStyleFile("ocean-inline.css"),
    },
  ].filter((entry) => entry.cssText.trim().length > 0);
}

export function buildRouteMetadata(slug: RouteSlug): Metadata {
  const route = ROUTES[slug];
  const yoast = route.yoast;

  const description = yoast?.og_description;
  const images =
    yoast?.og_image?.map((image) => ({
      height: image.height,
      type: image.type,
      url: image.url,
      width: image.width,
    })) ?? [];

  const otherMeta: Record<string, string> = {};
  if (yoast?.article_modified_time) {
    otherMeta["article:modified_time"] = yoast.article_modified_time;
  }
  if (yoast?.robots?.["max-snippet"]) {
    otherMeta["robots:max-snippet"] = yoast.robots["max-snippet"];
  }
  if (yoast?.robots?.["max-image-preview"]) {
    otherMeta["robots:max-image-preview"] = yoast.robots["max-image-preview"];
  }
  if (yoast?.robots?.["max-video-preview"]) {
    otherMeta["robots:max-video-preview"] = yoast.robots["max-video-preview"];
  }

  const metadata: Metadata = {
    alternates: yoast?.canonical
      ? {
          canonical: yoast.canonical,
        }
      : undefined,
    description,
    openGraph: {
      description,
      images,
      locale: yoast?.og_locale,
      siteName: yoast?.og_site_name,
      title: yoast?.og_title ?? yoast?.title ?? route.title,
      url: yoast?.og_url ?? route.path,
    },
    other: Object.keys(otherMeta).length > 0 ? otherMeta : undefined,
    robots: yoast?.robots
      ? {
          follow: yoast.robots.follow !== "nofollow",
          index: yoast.robots.index !== "noindex",
        }
      : undefined,
    title: yoast?.title ?? route.title,
    twitter: {
      description,
      images: images.map((image) => image.url),
      title: yoast?.og_title ?? yoast?.title ?? route.title,
    },
  };

  return metadata;
}
