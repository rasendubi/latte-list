import React from 'react';
import getUrls from 'get-urls';
import { useHistory } from 'react-router-dom';
import { useDebounce } from 'react-use';

import firebase, { useMeta } from '@/firebase/client';
import { saveItem } from '@/lib/items';
import { Item } from '@/lib/Item';
import AddDialogView from '@/components/AddDialogView';

export interface AddDialogProps {
  open: boolean;
}

const AddDialog = ({ ...props }: AddDialogProps) => {
  const [title, setTitle] = React.useState<string | null>(null);
  const [url, setUrl] = React.useState<string | null | undefined>(undefined);

  // TODO: this should be extracted to outside
  React.useEffect(() => {
    const u = new URL(window.location.toString());
    const params = {
      title: u.searchParams.get('title'),
      text: u.searchParams.get('text'),
      url: u.searchParams.get('url'),
    };

    const url =
      params.url ||
      findUrlIn(params.text) ||
      // not sure if any app sends it in title?
      findUrlIn(params.title);

    if (params.title && (params.text || params.url)) {
      setTitle(params.title);
    }
    setUrl(url);
  }, []);

  const [debouncedUrl, setDebouncedUrl] = React.useState(url);
  useDebounce(() => setDebouncedUrl(url), 500, [url]);
  const { meta, isLoading: metaIsLoading } = useMeta(debouncedUrl);
  const isLoading = metaIsLoading || url !== debouncedUrl;

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

  const history = useHistory();
  const [isSaving, setIsSaving] = React.useState(false);
  const handleSaveClick = async () => {
    const user = firebase.auth().currentUser;
    setIsSaving(true);
    if (user) {
      await saveItem(user.uid, item);
    }
    history.replace('/');
  };

  return (
    <AddDialogView
      url={url ?? ''}
      item={item}
      isLoading={isLoading}
      isSaving={isSaving}
      onUrlChange={setUrl}
      onTitleChange={setTitle}
      onCloseClick={() => history.replace('/')}
      onSaveClick={handleSaveClick}
      {...props}
    />
  );
};

export default AddDialog;

function findUrlIn(text: string | null): string | null {
  if (!text) return null;
  // This unpacking relies on Sets preserving insertion order
  const urls = [...getUrls(text, { requireSchemeOrWww: true })];
  if (!urls.length) return null;
  // when urls are appended to "text" param, they are usually
  // (always?) the last
  return urls[urls.length - 1];
}
