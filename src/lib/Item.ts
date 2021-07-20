import firebase from 'firebase';

import { SpacingParams } from '@/lib/spacing';

export interface Item {
  id: string;
  url: string;
  title: string;
  description: string | null;
  image: string | null;
  /** time to read the item in minutes */
  minutes: number | null;
  words: number | null;
  icon: string | null;
  /** number of times the item has been pinned */
  nPins: number;

  spacingParams: SpacingParams;

  addedOn: firebase.firestore.Timestamp;
  scheduledOn: firebase.firestore.Timestamp | null;
  pinnedOn: firebase.firestore.Timestamp | null;
}
