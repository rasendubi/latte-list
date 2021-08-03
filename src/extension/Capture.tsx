import React from 'react';
import browser from 'webextension-polyfill';

import AddDialog from '@/components/AddDialog';
import firebase from '@/firebase/client';
import { ItemMeta } from '@/lib/Item';
import { extractMeta } from '@/lib/extractMeta';

export interface CaptureProps {}

const Capture = ({}: CaptureProps) => {
  const [tab, setTab] = React.useState<browser.Tabs.Tab | null>(null);
  const [meta, setMeta] = React.useState<ItemMeta | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const [tab] = await browser.tabs.query({
          active: true,
          currentWindow: true,
        });

        try {
          const [html] = await browser.tabs.executeScript(tab.id, {
            code: `document.documentElement.outerHTML`,
          });

          if (tab.url && html) {
            setMeta(extractMeta(tab.url, html));
          }
        } catch (e) {}

        setTab(tab);
      } catch (e) {
        // TODO: Unable to get the current tab. It’s likely a system
        // tab. Report the error to the user properly.
        window.close();
      }
    })();
  }, []);

  const handleClose = async () => {
    // TODO: what happens if network is not available? we should
    // handle that and show an error message or perhaps queue the
    // upload in the background script?
    await firebase.firestore().waitForPendingWrites();
    window.close();
  };

  return (
    <div style={{ minWidth: 400, minHeight: 400 }}>
      {tab && (
        <AddDialog
          open={true}
          initialUrl={tab.url || ''}
          initialTitle={tab.title || ''}
          initialMeta={meta}
          onClose={handleClose}
        />
      )}
    </div>
  );

  // return <pre>{JSON.stringify(tab, null, 2)}</pre>;
};

export default Capture;
