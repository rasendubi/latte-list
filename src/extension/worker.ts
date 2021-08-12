import { extractMeta } from '@/lib/extractMeta';

addEventListener('message', (message) => {
  if (message.data.type === 'extractMeta') {
    postMessage({
      type: 'extractMeta',
      meta: extractMeta(message.data.url, message.data.html),
    });
  }
});

export {};
