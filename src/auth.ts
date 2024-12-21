import { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
import { useCached, useLogin } from './utils';

const CLIENT_ID =
  '';
const API_KEY = '';

const TASKS_DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest',
];
const TASKS_SCOPE = 'https://www.googleapis.com/auth/tasks';

let called = false;

function initClient(updateLoggedInStatus: (status: boolean) => void) {
  if (called) return;
  called = true;
  gapi.client
    .init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: TASKS_DISCOVERY_DOCS,
      scope: TASKS_SCOPE,
    })
    .then(() => {
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateLoggedInStatus);

      // initial sign in
      updateLoggedInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    })
    .catch((err) => {
      console.error('Auth init error: ', err);
    });
}

export function useGoogleAPI() {
  const { loggedIn, setLoggedIn } = useLogin();
  const [clientInit, setClientInit] = useState(false);
  const [offlineAccess, setOfflineAccess] = useCached('offlineaccess', false);

  useEffect(() => {
    if (!loggedIn)
      gapi.load('client:auth2', () => {
        initClient((status) => {
          setLoggedIn(status);
          setTimeout(() => {
            if (status && !offlineAccess)
              gapi.auth2
                .getAuthInstance()
                .currentUser.get()
                .grantOfflineAccess({ scope: TASKS_SCOPE, prompt: 'consent' })
                .then(({ code }) => {
                  setOfflineAccess(true);
                });
          }, 5000);
        });
        setClientInit(true);
      });
  }, [loggedIn, setLoggedIn, offlineAccess, setOfflineAccess]);

  const authInstance = clientInit
    ? gapi.auth2.getAuthInstance()
    : { signIn: () => {}, signOut: () => {} };

  return {
    loggedIn: loggedIn,
    setLoggedIn: setLoggedIn,
    logIn: authInstance.signIn,
    logOut: authInstance.signOut,
    username: loggedIn
      ? gapi.auth2
          .getAuthInstance()
          .currentUser.get()
          .getBasicProfile()
          .getGivenName()
      : null,
  };
}
