import firebase from '@/firebase/client';
import { getScheduleLaterUpdate } from '@/lib/scheduling';
import { Item } from '@/lib/Item';

export const saveItem = async (uid: string, item: any) => {
  const db = firebase.firestore();
  const items = db
    .collection('users')
    .doc(uid)
    .collection('items') as firebase.firestore.CollectionReference<Item>;

  const existing = (await items.where('url', '==', item.url).get()).docs[0];
  if (existing) {
    existing.ref.update(item);
  } else {
    let data: Item = {
      nPins: 0,
      ...item,
      addedOn: new Date(),
    };
    data = { ...item, ...getScheduleLaterUpdate(data) };
    items.doc().set(data);
  }
};
