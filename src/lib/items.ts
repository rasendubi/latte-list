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
  if (item.url && existing) {
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

export function getHostname(url: string) {
  try {
    const u = new URL(url);
    return u.hostname;
  } catch (e) {
    return null;
  }
}

export async function exportItems(uid: string) {
  const itemsSnapshot = await firebase
    .firestore()
    .collection(`users/${uid}/items`)
    .get();
  const items = itemsSnapshot.docs.map((d) => d.data());
  saveAsFile(
    JSON.stringify(items, null, 2),
    'latte-list.json',
    'application/json'
  );
}

export async function importItems(
  uid: string
): Promise<{ itemsImported: number }> {
  const backupToItem = (b: any) => ({
    ...b,
    addedOn: jsonToTimestamp(b.addedOn),
    scheduledOn: jsonToTimestamp(b.scheduledOn),
    pinnedOn: jsonToTimestamp(b.pinnedOn),
    archivedOn: jsonToTimestamp(b.archivedOn),
  });
  const items: Item[] = JSON.parse(await loadFile()).map(backupToItem);
  const collection = firebase.firestore().collection(`users/${uid}/items`);
  await Promise.all(items.map((item) => collection.add(item)));
  return { itemsImported: items.length };
}

const jsonToTimestamp = (
  j: { seconds: number; nanoseconds: number } | null
): firebase.firestore.Timestamp | null =>
  j && new firebase.firestore.Timestamp(j.seconds, j.nanoseconds);

function saveAsFile(content: string, filename: string, contentType: string) {
  const file = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(file);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

function loadFile(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e) => {
      const file = e.target.files[0];

      const reader = new FileReader();
      reader.readAsText(file, 'utf-8');

      reader.onload = (e) => {
        const content = e.target.result;
        resolve(content);
      };
    };

    input.click();
  });
}
