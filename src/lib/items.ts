import firebase from '@/firebase/client';
import { audit, AuditAction, AuditContext } from './audit';
import { Item } from './Item';
import { getScheduleLaterUpdate, getSchedulePinUpdate } from './scheduling';

export async function saveItem(
  uid: string,
  item: any,
  context: AuditContext = {}
) {
  const items = firebase
    .firestore()
    .collection('users')
    .doc(uid)
    .collection('items') as firebase.firestore.CollectionReference<Item>;

  // TODO: this call might be blocking on poor connection…
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
    const doc = items.doc();
    doc.set(data);
    audit(doc, 'add', context, null, data);
  }
}

export async function scheduleLater(
  item: firebase.firestore.QueryDocumentSnapshot<Item>,
  context: AuditContext = {}
) {
  updateWithAudit(item, 'later', context, (prev) =>
    getScheduleLaterUpdate(prev)
  );
}

export function pinItem(
  item: firebase.firestore.QueryDocumentSnapshot<Item>,
  context: AuditContext = {}
) {
  updateWithAudit(item, 'pin', context, (prev) => ({
    pinnedOn: firebase.firestore.Timestamp.now(),
    archivedOn: null,
    nPins: prev.nPins + 1,
    ...getSchedulePinUpdate(),
  }));
}

export function unpinItem(
  item: firebase.firestore.QueryDocumentSnapshot<Item>,
  context: AuditContext = {}
) {
  updateWithAudit(item, 'unpin', context, (prev) => ({
    pinnedOn: null,
    ...getScheduleLaterUpdate(prev),
  }));
}

export async function archiveItem(
  item: firebase.firestore.QueryDocumentSnapshot<Item>,
  context: AuditContext = {}
) {
  updateWithAudit(item, 'archive', context, {
    archivedOn: firebase.firestore.Timestamp.now(),
    scheduledOn: null,
    pinnedOn: null,
    spacingParams: null,
  });
}

export async function unarchiveItem(
  item: firebase.firestore.QueryDocumentSnapshot<Item>,
  context: AuditContext = {}
) {
  updateWithAudit(item, 'unarchive', context, (prev) => ({
    archivedOn: null,
    ...getScheduleLaterUpdate(prev),
  }));
}

export async function deleteItem(
  item: firebase.firestore.QueryDocumentSnapshot<Item>,
  context: AuditContext = {}
) {
  const prev = item.data();
  item.ref.delete();
  audit(item.ref, 'delete', context, prev, null);
}

function updateWithAudit(
  item: firebase.firestore.QueryDocumentSnapshot<Item>,
  action: AuditAction,
  context: AuditContext,
  update: Partial<Item> | ((item: Item) => Partial<Item>)
) {
  const prev = item.data();
  item.ref.update(typeof update === 'function' ? update(prev) : update);
  const next = { ...prev, ...update };
  audit(item.ref, action, context, prev, next);
}
