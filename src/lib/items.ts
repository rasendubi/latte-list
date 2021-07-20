import firebase from '@/firebase/client';
import { Item } from './Item';
import { getScheduleLaterUpdate, getSchedulePinUpdate } from './scheduling';

export function pinItem(item: firebase.firestore.DocumentSnapshot<Item>) {
  item.ref.update({
    pinnedOn: firebase.firestore.Timestamp.now(),
    ...getSchedulePinUpdate(),
  });
}

export async function saveItem(uid: string, item: any) {
  const items = firebase
    .firestore()
    .collection('users')
    .doc(uid)
    .collection('items') as firebase.firestore.CollectionReference<Item>;

  // TODO: is call might be blocking on poor connection…
  const existing = (await items.where('url', '==', item.url).get()).docs[0];
  if (existing) {
    existing.ref.update(item);
  } else {
    let data: Item = {
      nPins: 0,
      ...item,
      addedOn: firebase.firestore.Timestamp.now(),
    };
    data = { ...data, ...getScheduleLaterUpdate(data) };
    items.doc().set(data);
  }
}

export async function deleteItem(
  itemRef: firebase.firestore.DocumentReference<Item>
) {
  await itemRef.delete();
}

export async function archiveItem(
  item: firebase.firestore.DocumentReference<Item>
) {
  item.update({
    archivedOn: firebase.firestore.Timestamp.now(),
    scheduledOn: null,
    pinnedOn: null,
    spacingParams: null,
  });
}
