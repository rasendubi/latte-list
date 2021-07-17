import firebase from '@/firebase/client';
import { schedule } from '@/lib/scheduling';
import { Item } from '@/lib/Item';

export const saveItem = async (uid: string, item: any) => {
  const db = firebase.firestore();
  const items = db
    .collection('users')
    .doc(uid)
    .collection('items') as firebase.firestore.CollectionReference<Item>;

  const existing = (await items.where('url', '==', item.url).get()).docs[0];
  if (existing) {
    await existing.ref.update(item);
    if (!existing.data().scheduledOn) {
      await schedule(existing.ref);
    }
  } else {
    const itemRef = await items.add({
      nPins: 0,
      ...item,
      addedOn: new Date(),
    });
    await schedule(itemRef);
  }
};
