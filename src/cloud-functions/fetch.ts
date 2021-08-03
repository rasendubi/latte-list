import * as functions from 'firebase-functions';
import fetch from 'node-fetch';

import { extractMeta } from '@/lib/extractMeta';

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
//
// TODO: Consider moving this function to be firestore-triggered. This
// supports the offline use-case better.
export default functions
  .runWith({
    maxInstances: 1,
    timeoutSeconds: 20,
    memory: '512MB',
  })
  .https.onCall(async (data, context) => {
    if (process.env.NODE_ENV !== 'development' && !context.auth) {
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

    console.time('extractMeta');
    const meta = extractMeta(response.url, body);
    console.timeEnd('extractMeta');

    return { ...meta, queryUrl };
  });
