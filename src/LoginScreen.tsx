import React from 'react';

import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';

import firebase from '@/firebase/client';

export interface LoginScreenProps {}

const LoginScreen = ({}: LoginScreenProps) => {
  React.useEffect(() => {
    const ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start('#firebaseui-auth-container', {
      signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
    });
    return () => {
      ui.delete();
    };
  }, []);
  return <div id="firebaseui-auth-container" />;
};

export default LoginScreen;
