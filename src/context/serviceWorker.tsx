import React from 'react';

type ServiceWorkerContext = {
  registration: ServiceWorkerRegistration | null;
  newServiceWorkerAvailable: boolean;
  skipWaiting: () => void;
};
const ServiceWorkerContext = React.createContext<ServiceWorkerContext>({
  registration: null,
  newServiceWorkerAvailable: false,
  skipWaiting: () => {},
});

export interface ServiceWorkerProviderProps {
  scriptUrl: string;
  children: React.ReactNode;
}

export const ServiceWorkerProvider = ({
  scriptUrl,
  children,
}: ServiceWorkerProviderProps) => {
  const [newServiceWorkerAvailable, setNewServiceWorkerAvailable] =
    React.useState(false);
  const [registration, setRegistration] =
    React.useState<ServiceWorkerRegistration | null>(null);
  const newWorker = React.useRef<ServiceWorker | null>(null);

  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(scriptUrl).then((registration) => {
        setRegistration(registration);
        // To be called when the next service worker is found.
        //
        // This should set newWorkerAvailable when the worker is ready
        // to take over (installed).
        const nextWorkerFound = (w: ServiceWorker) => {
          newWorker.current = w;
          if (w.state === 'installed') {
            setNewServiceWorkerAvailable(true);
          } else {
            w.addEventListener('statechange', () => {
              if (w.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  setNewServiceWorkerAvailable(true);
                }
              }
            });
          }
        };

        // if update is already found, use it
        const maybeWorker =
          registration.installing ||
          registration.waiting ||
          registration.active;
        if (maybeWorker) {
          nextWorkerFound(maybeWorker);
        }

        // search for updates
        registration.addEventListener('updatefound', () => {
          const w = registration.installing!;
          nextWorkerFound(w);
        });
        registration.update();
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // the server worker has changed → reload the page
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    }
  }, []);

  const context = {
    registration,
    newServiceWorkerAvailable,
    skipWaiting: () => {
      newWorker.current?.postMessage({ action: 'skipWaiting' });
    },
  };

  return (
    <ServiceWorkerContext.Provider value={context}>
      {children}
    </ServiceWorkerContext.Provider>
  );
};

export const useServiceWorker = () => React.useContext(ServiceWorkerContext);
