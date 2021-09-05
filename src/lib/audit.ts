import React from 'react';
import Debug from 'debug';

import firebase, { useDocument } from '@/firebase/client';
import { useUser } from '@/context/userContext';
import { Item } from './Item';
import { getHostname } from './items';
import { SpacingParams } from './spacing';

const debug = Debug('latte:lib:audit');

interface ItemAuditCommonFields {
  hostname: string | null;
  minutes: number | null;
  nPins: number;
  spacingParams: SpacingParams | null;
  addedOn: firebase.firestore.Timestamp;
  scheduledOn: firebase.firestore.Timestamp | null;
  pinnedOn: firebase.firestore.Timestamp | null;
  archivedOn: firebase.firestore.Timestamp | null;
}

export type AuditAction =
  | 'add'
  | 'later'
  | 'pin'
  | 'unpin'
  | 'archive'
  | 'unarchive'
  | 'delete'
  | 'open';

export interface AuditContext {
  review?: boolean;
}

interface ItemAuditLine {
  time: firebase.firestore.Timestamp;
  action: AuditAction;
  context: AuditContext;
  prev: ItemAuditCommonFields | null;
  next: ItemAuditCommonFields | null;
}

export async function audit(
  ref: firebase.firestore.DocumentReference,
  action: AuditAction,
  context: AuditContext,
  prev: Item | null,
  next: Item | null
) {
  debug('audit %o', { ref, action, context, prev, next });

  const user = firebase.auth().currentUser;
  if (!user) return;
  const profile = await firebase.firestore().doc(`users/${user.uid}`).get();
  if (!profile.data()?.auditOptIn) return;

  const audit: ItemAuditLine = {
    time: firebase.firestore.Timestamp.now(),
    action,
    context,
    prev: prev && extractItemAuditCommonFields(prev),
    next: next && extractItemAuditCommonFields(next),
  };
  ref.collection('item_audit').add(audit);
}

function extractItemAuditCommonFields({
  nPins,
  spacingParams,
  addedOn,
  scheduledOn,
  pinnedOn,
  archivedOn,
  url,
  ...item
}: Item): ItemAuditCommonFields {
  return {
    nPins,
    spacingParams,
    addedOn,
    scheduledOn,
    pinnedOn,
    archivedOn,
    hostname: getHostname(url),
    minutes: item.meta?.minutes ?? null,
  };
}

export function saveAuditOptIn(auditOptIn: boolean) {
  const user = firebase.auth().currentUser;
  if (!user) {
    throw Error('not logged in');
  }

  firebase
    .firestore()
    .doc(`users/${user.uid}`)
    .set({ auditOptIn }, { merge: true });
}

/**
 * Returns `true` if audit is allowed, `false` if audit is explicitly
 * prohibited, `null` if decision hasn’t been made yet, `undefined` if
 * still loading.
 */
export function useAuditOptIn(): boolean | null | undefined {
  const { user } = useUser();
  const query = React.useMemo(
    () => user && firebase.firestore().doc(`users/${user.uid}`),
    [user]
  );
  const profile = useDocument(query);
  const optIn = profile && profile.data()?.auditOptIn;
  return user && profile ? (optIn === undefined ? null : optIn) : undefined;
}
