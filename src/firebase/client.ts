import { ItemMeta } from '@/lib/Item';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
// import 'firebase/storage';
// import 'firebase/analytics';
// import 'firebase/performance';
import 'firebase/functions';

import React from 'react';

const clientCredentials = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

if (!firebase.apps.length) {
  firebase.initializeApp(clientCredentials);
  // Check that `window` is in scope for the analytics module!
  if (typeof window !== 'undefined') {
    // Enable analytics. https://firebase.google.com/docs/analytics/get-started
    if ('measurementId' in clientCredentials) {
      firebase.analytics();
      firebase.performance();
    }

    if (
      location.hostname === 'localhost' ||
      location.protocol === 'moz-extension:'
    ) {
      // firebase.auth().useEmulator('http://localhost:9099');
      // firebase.firestore().useEmulator('localhost', 8080);
      firebase.functions().useEmulator('localhost', 5001);
    }

    // firebase.firestore().settings({
    //   cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
    // });
    // TODO: we might need to ask the user if they’re on a trusted device
    // firebase.firestore().enablePersistence({
    //   synchronizeTabs: true,
    // });
  }
}

export default firebase;

export const fetchStats = (url: string) =>
  firebase
    .functions()
    .httpsCallable('fetch')({ url })
    .then(({ data }) => data);

export const useMeta = (
  url: string | null | undefined
): { meta: ItemMeta | null; isLoading: boolean } => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [meta, setMeta] = React.useState<any | null>(null);

  // to ensure we’re not overwriting meta when getting old results
  const i = React.useRef(0);
  React.useEffect(() => {
    if (meta?.url === url) {
      return;
    }

    setMeta(null);
    if (!url) {
      setIsLoading(false);
      return;
    }
    try {
      new URL(url);
    } catch {
      setIsLoading(false);
      return;
    }
    // if (!url) {
    //   setIsLoading(false);
    //   return;
    // }

    setIsLoading(true);
    i.current++;
    const me = i.current;
    fetchStats(url)
      .then((data) => {
        if (me === i.current) {
          setMeta(data);
        }
      })
      .catch((e) => {
        console.warn('Error fetching meta:', e);
        if (me === i.current) {
          setMeta(null);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
    // TODO: handle error / isLoading
  }, [url]);

  return { meta, isLoading };
};

export type UseCollectionOptions = {
  /**
   * When query is updating, whether to return stale data from
   * previous query.
   */
  showStale?: boolean;
};

export function useCollection<T>(
  query: firebase.firestore.Query<T> | null,
  { showStale = false }: UseCollectionOptions = {}
) {
  const [result, setResult] =
    React.useState<firebase.firestore.QuerySnapshot<T> | null>(null);
  React.useEffect(() => {
    if (!showStale) {
      setResult(null);
    }

    if (!query) return;
    const unsubscribe = query.onSnapshot(setResult);
    return () => unsubscribe();
  }, [query, showStale]);
  return result;
}

export function useDocument<T>(
  query: firebase.firestore.DocumentReference<T> | null
) {
  const [result, setResult] =
    React.useState<firebase.firestore.DocumentSnapshot<T> | null>(null);
  React.useEffect(() => {
    if (!query) return;
    const unsubscribe = query.onSnapshot(setResult);
    return () => unsubscribe();
  }, [query]);
  return result;
}

export function useCollectionData<T>(
  query: firebase.firestore.Query<T> | null
) {
  const [result, setResult] = React.useState<T[] | null>(null);
  React.useEffect(() => {
    setResult(null);

    if (!query) {
      return;
    }

    const unsubscribe = query.onSnapshot((snapshot) =>
      setResult(snapshot.docs.map((d) => d.data()))
    );
    return () => unsubscribe();
  }, [query]);
  return result;
}
