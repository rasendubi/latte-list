import React from 'react';
import Debug from 'debug';

import { useServiceWorker } from '@/context/serviceWorker';
import firebase from '@/firebase/client';

const debug = Debug('latte:lib:notifications');

export function useNotifications() {
  const { subscriptionState, refresh } = useSubscriptionState();

  const [subscriptionRegistered, setSubscriptionRegistered] = React.useState<
    boolean | undefined
  >();
  React.useEffect(() => {
    if (!subscriptionState.subscription) {
      setSubscriptionRegistered(false);
      return;
    }

    const user = firebase.auth().currentUser;
    if (!user) {
      console.warn('[notifications] no user');
      return;
    }
    firebase
      .firestore()
      .collection(`users/${user.uid}/push_subscriptions`)
      .where(
        'subscription.endpoint',
        '==',
        subscriptionState.subscription.endpoint
      )
      .get()
      .then((docs) => {
        setSubscriptionRegistered(!!docs.docs.length);
      });
  }, [subscriptionState]);

  const enabled =
    subscriptionState.permission === 'granted' && subscriptionRegistered;

  debug({ ...subscriptionState, subscriptionRegistered, enabled });

  const subscribe = async () => {
    let permission = Notification.permission;
    if (permission !== 'granted') {
      permission = await Notification.requestPermission();
    }

    // call refresh() *before* checking the permission, so permission
    // state is properly updated and displayed in the UI.
    const { subscription } = await refresh();
    if (!subscription) {
      debug('no subscription after refresh %o', subscription);
      return;
    }

    if (permission !== 'granted') {
      return;
    }

    const user = firebase.auth().currentUser;
    if (!user) {
      console.warn('[notifications] no user');
      return;
    }
    const docs = await firebase
      .firestore()
      .collection(`users/${user.uid}/push_subscriptions`)
      .where('subscription.endpoint', '==', subscription.endpoint)
      .get();
    if (!docs.docs.length) {
      await firebase
        .firestore()
        .collection(`users/${user.uid}/push_subscriptions`)
        .add({ subscription });
      setSubscriptionRegistered(true);
    }
  };
  const unsusbscribe = async () => {
    const { subscription } = await refresh();
    if (subscription) {
      const user = firebase.auth().currentUser;
      if (!user) {
        console.warn('[notifications] no user');
        return;
      }
      const docs = await firebase
        .firestore()
        .collection(`users/${user.uid}/push_subscriptions`)
        .where('subscription.endpoint', '==', subscription.endpoint)
        .get();
      if (docs.docs.length) {
        await docs.docs[0].ref.delete();
        setSubscriptionRegistered(false);
      }
    }
  };
  const setEnabled = async (enabled: boolean) => {
    debug('setEnabled %o', enabled);
    if (enabled) {
      await subscribe();
    } else {
      await unsusbscribe();
    }
  };

  return {
    supported: subscriptionState.supported,
    permission: subscriptionState.permission,
    enabled,
    setEnabled,
  };
}

function useSubscriptionState(): {
  subscriptionState: SubscriptionState;
  refresh: () => Promise<SubscriptionState>;
} {
  const { registration } = useServiceWorker();

  const [subscriptionState, setSubscriptionState] =
    React.useState<SubscriptionState>({ supported: false });

  React.useEffect(() => {
    if (registration) {
      getSubscriptionState(registration).then(setSubscriptionState);
    }
  }, [registration]);

  const refresh = async () => {
    if (!registration) {
      debug('refresh without registration!');
    }
    const state = await getSubscriptionState(registration!);
    setSubscriptionState(state);
    return state;
  };

  return { subscriptionState, refresh };
}

interface SubscriptionState {
  supported: boolean;
  permission?: NotificationPermission;
  subscription?: PushSubscriptionJSON | null;
}
async function getSubscriptionState(
  registration: ServiceWorkerRegistration
): Promise<SubscriptionState> {
  const supported =
    'Notification' in window &&
    // probably is reduntant because we literally hold a registration
    // to service worker?
    'serviceWorker' in navigator &&
    'PushManager' in window;
  if (!supported) {
    return { supported };
  }

  const permission = Notification.permission;
  if (permission !== 'granted') {
    return { supported, permission, subscription: null };
  }

  let sub: PushSubscription | null = null;
  sub = await registration.pushManager.getSubscription();
  if (!sub) {
    try {
      sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VAPID_PUBLIC_KEY,
      });
    } catch (e) {
      // We are denied of subscription when we rightfully (?)
      // should have it.
      //
      // Returning supported: false is probably our best option.
      //
      // TODO: this _might_ lead to poor user experience if user
      // explicitly grants notification permission and then we bail
      // out and say notifications are not supported.
      return { supported: false };
    }
  }

  const subscription = sub.toJSON();

  return {
    supported,
    permission,
    subscription,
  };
}

export function useCloseNotifications(filter?: GetNotificationOptions) {
  const { registration } = useServiceWorker();
  React.useEffect(() => {
    if (!registration) {
      return;
    }

    const clearNotifications = () => {
      if (document.visibilityState === 'visible') {
        registration.getNotifications(filter).then((notifications) => {
          notifications.forEach((n) => n.close());
        });
      }
    };

    clearNotifications();
    document.addEventListener('visibilitychange', clearNotifications);
    return () =>
      document.removeEventListener('visibilitychange', clearNotifications);
  }, [registration]);
}
