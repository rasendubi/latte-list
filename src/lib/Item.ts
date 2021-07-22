import type firebase from 'firebase';

import { SpacingParams } from '@/lib/spacing';

export interface ItemMeta {
  /** canonical url */
  url: string;
  /** original url */
  queryUrl: string;
  title: string | null;
  description: string | null;
  image: string | null;
  /** favicon */
  icon: string | null;
  /** time to read the item in minutes */
  minutes: number | null;
  words: number | null;

  queriedOn: firebase.firestore.Timestamp;
}

export interface Item {
  url: string;
  title: string | null;
  meta: ItemMeta | null;

  /** number of times the item has been pinned */
  nPins: number;

  spacingParams: SpacingParams | null;

  addedOn: firebase.firestore.Timestamp;
  scheduledOn: firebase.firestore.Timestamp | null;
  pinnedOn: firebase.firestore.Timestamp | null;
  archivedOn: firebase.firestore.Timestamp | null;
}
