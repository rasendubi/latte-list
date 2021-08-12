import React from 'react';
import browser from 'webextension-polyfill';

import AddDialog from '@/components/AddDialog';
import firebase from '@/firebase/client';
import { ItemMeta } from '@/lib/Item';

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
        setTab(tab);

        try {
          const [html] = await browser.tabs.executeScript(tab.id, {
            code: `document.documentElement.outerHTML`,
          });

          if (tab.url && html) {
            const meta = await new Promise<ItemMeta | null>(
              (resolve, reject) => {
                const worker = new Worker(
                  new URL('./worker.ts', import.meta.url)
                );
                worker.postMessage({ type: 'extractMeta', url: tab.url, html });
                worker.addEventListener('message', (m) => {
                  if (m.data.type === 'extractMeta') {
                    resolve(m.data.meta);
                    worker.terminate();
                  }
                });
              }
            );
            setMeta(meta);
          }
        } catch (e) {}
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
