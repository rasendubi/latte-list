import firebase from 'firebase';

import { Item } from '@/lib/Item';
import { initialParams, space } from './spacing';

export async function schedule(
  itemRef: firebase.firestore.DocumentReference<Item>
) {
  const item = (await itemRef.get()).data();
  if (!item) return;

  const params = item.spacingParams || initialParams();
  const { increment, params: nextParams } = space(item, params);
  const scheduledOn = new Date(Date.now() + increment * 24 * 60 * 60 * 1000);

  await itemRef.update({ scheduledOn, spacingParams: nextParams });
}
