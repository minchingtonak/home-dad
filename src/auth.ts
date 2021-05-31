import { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
import { useLogin } from './utils';

// TODO use dotenv for these
const CLIENT_ID =
  '127110911213-b8q7v0qff6k5jsrubph4h66qr7h61otj.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBsr4tYkit6enDK16_NX9xrAH3hu7xUbmk';

const TASKS_DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest',
];
const TASKS_SCOPES = 'https://www.googleapis.com/auth/tasks';

let called = false;

function initClient(updateLoggedInStatus: (status: boolean) => void) {
  if (called) return;
  called = true;
  gapi.client
    .init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: TASKS_DISCOVERY_DOCS,
      scope: TASKS_SCOPES,
    })
    .then(() => {
      console.log('gapi.auth2', gapi.auth2);

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

  useEffect(() => {
    gapi.load('client:auth2', () => {
      initClient((status) => {
        setLoggedIn(status);
      });
      setClientInit(true);
      console.log(gapi.client);
    });
  }, []);

  const authInstance = clientInit
    ? gapi.auth2.getAuthInstance()
    : { signIn: () => {}, signOut: () => {} };

  return {
    loggedIn: loggedIn,
    setLoggedIn: setLoggedIn,
    logIn: authInstance.signIn,
    logOut: authInstance.signOut,
  };
}
