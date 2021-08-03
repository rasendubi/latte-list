import unified from 'unified';
import parse from 'rehype-parse';
import { select } from 'hast-util-select';
import toString from 'hast-util-to-string';
import toText from 'hast-util-to-text';
import stringReadingTime from 'reading-time';

import { ItemMeta } from '@/lib/Item';
import firebase from '@/firebase/client';

const excludedDomains = new Set(['www.youtube.com', 'music.google.com']);

export function extractMeta(inputUrl: string, html: string): ItemMeta {
  const hast = unified().use(parse).parse(html);
  const url = getCanonicalUrl(inputUrl, hast);
  const title = getTitle(hast) || url;
  const description = getDescription(hast);
  const image = getImage(hast);
  const icon = getIcon(hast, inputUrl);
  const { minutes, words } =
    url && excludedDomains.has(new URL(inputUrl).hostname)
      ? { minutes: null, words: null }
      : readingTime(selectMainContent(hast));

  // TODO: the method above fails on pages that require JS to load the
  // title, etc. We might need to resort to running puppeteer or
  // something similar.

  return {
    queriedOn: firebase.firestore.Timestamp.now(),
    queryUrl: inputUrl,
    url,
    title,
    description,
    image,
    minutes,
    words,
    icon,
  };
}

// TODO: displays wrong “reading” time for YouTube
function readingTime(hast: any): {
  minutes: number | null;
  words: number | null;
} {
  const s: string = toText(hast);
  if (s.trim().length === 0) {
    return { minutes: null, words: null };
  }

  const { minutes, words } = stringReadingTime(s);
  return { minutes, words };
}

function getCanonicalUrl(originalUrl: string, hast: any): string {
  const canonicalUrl =
    select('link[rel=canonical]', hast)?.properties.href ||
    select('meta[property=og:url]', hast)?.properties.content;
  if (!canonicalUrl) return originalUrl;

  const original = new URL(originalUrl);
  const canonical = new URL(canonicalUrl);
  canonical.hash = original.hash; // copy anchors
  // TODO: copy query? canonical url has supposedly stripped extra
  // query params, so we probably don’t need that
  return canonical.toString();
}

function getTitle(hast: any): string | null {
  let title = select('meta[property=og:title]', hast)?.properties.content;
  if (title) return title;

  const titleTag =
    select('title', hast) || select('h1', selectMainContent(hast));
  if (titleTag) return toString(titleTag);

  return null;
}

function getDescription(hast: any): string | null {
  const description =
    select('meta[property=og:description]', hast)?.properties.content ||
    select('meta[property=description]', hast)?.properties.content;
  // TODO: fallback to extracting first paragraph from main content
  return description ?? null;
}

function getImage(hast: any): string | null {
  const image =
    select('meta[property=og:image]', hast)?.properties.content ||
    select('meta[property=og:image:url]', hast)?.properties.content;
  if (image) return image;

  // TODO: fallback to extracting first image from the main content

  return null;
}

function getIcon(hast: any, baseUrl: string): string | null {
  const favicon =
    select('link[rel=icon]', hast) || select('link[rel="shortcut icon"]', hast);
  if (!favicon) return null;

  // TODO: try hostname/favicon.ico as a fallback

  const url = new URL(favicon.properties.href, baseUrl);
  return url.toString();
}

function selectMainContent(hast: any): any {
  let content = hast;
  content = select('body', content) || content;
  content = select('main', content) || content;
  content = select('article', content) || content;
  return content;
}
