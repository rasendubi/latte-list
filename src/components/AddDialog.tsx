import React from 'react';
import getUrls from 'get-urls';
import { useDebounce } from 'react-use';

import firebase, { useMeta } from '@/firebase/client';
import { saveItem } from '@/lib/items';
import { Item, ItemMeta } from '@/lib/Item';
import AddDialogView from '@/components/AddDialogView';

export interface AddDialogProps {
  initialTitle: string;
  initialUrl: string;
  initialMeta?: ItemMeta | null;
  open: boolean;
  onClose?: () => void;
}

const AddDialog = ({
  initialUrl,
  initialTitle,
  initialMeta,
  onClose,
  ...props
}: AddDialogProps) => {
  const [url, setUrl] = React.useState(initialUrl);
  const [title, setTitle] = React.useState(initialTitle);

  const [debouncedUrl, setDebouncedUrl] = React.useState(url);
  useDebounce(() => setDebouncedUrl(url), 500, [url]);
  const initialMetaIsValid =
    initialUrl === debouncedUrl && initialMeta !== undefined;
  const { meta: loadedMeta, isLoading: metaIsLoading } = useMeta(
    initialMetaIsValid ? null : debouncedUrl
  );
  const isLoading = metaIsLoading || url !== debouncedUrl;
  const meta = initialMetaIsValid ? initialMeta : loadedMeta;

  const item: Item = {
    url: meta?.url || url || '',
    title: title || meta?.title || meta?.url || url || '',
    meta,
    nPins: 0,
    spacingParams: null,
    addedOn: firebase.firestore.Timestamp.now(),
    scheduledOn: null,
    archivedOn: null,
    pinnedOn: null,
  };

  const [isSaving, setIsSaving] = React.useState(false);
  const handleSaveClick = async () => {
    const user = firebase.auth().currentUser;
    setIsSaving(true);
    if (user) {
      await saveItem(user.uid, item);
    }

    onClose?.();
  };

  return (
    <AddDialogView
      url={url}
      item={item}
      isLoading={isLoading}
      isSaving={isSaving}
      onUrlChange={setUrl}
      onTitleChange={setTitle}
      onCloseClick={onClose}
      onSaveClick={handleSaveClick}
      {...props}
    />
  );
};

export default AddDialog;
