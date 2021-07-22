import firebase from '@/firebase/client';

import { Item } from '@/lib/Item';
import { initialParams, space } from './spacing';

export function getScheduleLaterUpdate(item: Item): Partial<Item> {
  const params = item.spacingParams || initialParams();
  const { increment, params: nextParams } = space(item, params);
  const scheduledOn = firebase.firestore.Timestamp.fromDate(
    new Date(Date.now() + increment * 24 * 60 * 60 * 1000)
  );

  return { scheduledOn, spacingParams: nextParams };
}

export function getSchedulePinUpdate(): Partial<Item> {
  return {
    spacingParams: { n: 0 },
    scheduledOn: null,
  };
}
