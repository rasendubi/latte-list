import firebase from 'firebase';

import { Item } from '@/lib/Item';
import { initialParams, space } from './spacing';

export async function scheduleLater(
  itemSnapshot: firebase.firestore.DocumentSnapshot<Item>
) {
  const item = itemSnapshot.data();
  if (!item) return;
  await itemSnapshot.ref.update(getScheduleLaterUpdate(item));
}

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
    nPins: firebase.firestore.FieldValue.increment(1) as any,
    spacingParams: { n: 0 },
    scheduledOn: null,
  };
}
