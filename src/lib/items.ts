import firebase from '@/firebase/client';
import { Item } from './Item';
import { getSchedulePinUpdate } from './scheduling';

export function pinItem(item: firebase.firestore.DocumentSnapshot<Item>) {
  item.ref.update({
    pinnedOn: firebase.firestore.Timestamp.now(),
    ...getSchedulePinUpdate(),
  });
}
