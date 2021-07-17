import * as functions from 'firebase-functions';
import fetch from 'node-fetch';

import unified from 'unified';
import parse from 'rehype-parse';
import { select } from 'hast-util-select';
import toString from 'hast-util-to-string';
import toText from 'hast-util-to-text';
import stringReadingTime from 'reading-time';

// TODO: This function is too slow. The target for downloading page
// and processing it is 1 second.
//
// It’s not a cold start issue. The "process" step just takes longer
// on the GCP (4–5 seconds vs 100–200ms locally).
//
// `memory` option directly influences CPU GHz allocated. See
// https://cloud.google.com/functions/pricing#compute_time for a table
// of available configurations.
//
// 128MB translates to 200MHz, so doing CPU-intensive processing isn’t
// very wise…
//
// Options to evaluate:
// 1. Increase memory limit
// 2. Offload CPU-intesive part to the client (it likely has more than
//    200MHz).
export default functions
  .runWith({
    maxInstances: 1,
    timeoutSeconds: 20,
    memory: '128MB',
  })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Unauthenticated'
      );
    }

    const queryUrl = data.url as string;
    if (typeof queryUrl !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        '"url" is not a string'
      );
    }

    console.time('fetch');
    const response = await fetch(queryUrl);
    const body = await response.text();
    console.timeEnd('fetch');

    console.time('process');
    const hast = unified().use(parse).parse(body);
    const url = getCanonicalUrl(queryUrl, hast);
    const title = getTitle(hast) || url;
    const description = getDescription(hast);
    const image = getImage(hast);
    const icon = getIcon(hast, queryUrl);
    const { minutes, words } = readingTime(selectMainContent(hast));
    console.timeEnd('process');

    // TODO: the method above fails on pages that require JS to load the
    // title, etc. We might need to resort to running puppeteer or
    // something similar.

    return { url, title, description, image, minutes, words, icon };
  });

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

function getCanonicalUrl(originalUrl: string, hast: any): string | null {
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
  let title = select('meta[property=og:title]')?.properties.content;
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
