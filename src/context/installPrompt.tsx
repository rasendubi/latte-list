import React from 'react';

type InstallPromptContext = (() => Promise<'accepted' | 'dismissed'>) | null;

const InstallPromptContext = React.createContext<InstallPromptContext>(null);

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
    appinstalled: Event;
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<'accepted' | 'dismissed'>;
}

export interface InstallPromptProviderProps {
  children: React.ReactNode;
}

export const InstallPromptProvider = ({
  children,
}: InstallPromptProviderProps) => {
  const [prompt, setPrompt] = React.useState<BeforeInstallPromptEvent | null>(
    null
  );

  React.useEffect(() => {
    const beforeinstallpromptHandler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setPrompt(e);
    };
    const appinstalledHandler = (e: Event) => {
      setPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', beforeinstallpromptHandler);
    window.addEventListener('appinstalled', appinstalledHandler);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        beforeinstallpromptHandler
      );
      window.removeEventListener('appinstalled', appinstalledHandler);
    };
  }, []);

  return (
    <InstallPromptContext.Provider
      value={
        prompt &&
        (async () => {
          prompt.prompt();
          const choice = await prompt.userChoice;
          setPrompt(null);
          return choice;
        })
      }
    >
      {children}
    </InstallPromptContext.Provider>
  );
};

export const useInstallPrompt = () => React.useContext(InstallPromptContext);
