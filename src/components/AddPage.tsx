import React from 'react';
import getUrls from 'get-urls';
import { useHistory } from 'react-router-dom';

import AddDialog from './AddDialog';

export interface AddPageProps {
  open: boolean;
}

const AddPage = ({ ...props }: AddPageProps) => {
  const [title, setTitle] = React.useState<string | null>(null);
  const [url, setUrl] = React.useState<string | null | undefined>(undefined);
  const [isReady, setIsReady] = React.useState(false);

  React.useLayoutEffect(() => {
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

    setIsReady(true);
  }, []);

  const history = useHistory();
  const handleClose = () => {
    history.replace('/');
  };

  return (isReady && (
    <AddDialog
      initialUrl={url ?? ''}
      initialTitle={title ?? ''}
      onClose={handleClose}
      {...props}
    />
  )) as JSX.Element;
};

export default AddPage;

function findUrlIn(text: string | null): string | null {
  if (!text) return null;
  // This unpacking relies on Sets preserving insertion order
  const urls = [...getUrls(text, { requireSchemeOrWww: true })];
  if (!urls.length) return null;
  // when urls are appended to "text" param, they are usually
  // (always?) the last
  return urls[urls.length - 1];
}
