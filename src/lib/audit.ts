import firebase from '@/firebase/client';
import { Item } from './Item';
import { getHostname } from './items';
import { SpacingParams } from './spacing';

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
  | 'delete';

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

export function audit(
  ref: firebase.firestore.DocumentReference,
  action: AuditAction,
  context: AuditContext,
  prev: Item | null,
  next: Item | null
) {
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
