import { useState } from 'react';
import styled from 'styled-components';
import { TASKS_API_URL } from './config';
import { useLogin, useLoginError } from './utils';

type LoginFailedWarningProps = {
  failed: boolean;
};

const LoginFailedWarning = styled.span<LoginFailedWarningProps>`
  margin: 0 0 5px 0;

  display: ${(props) => (props.failed ? 'inherit' : 'none')};

  color: red;
  font-size: 0.8em;
`;

const LoginForm = styled.form`
  padding: 10px;

  text-align: left;
`;

const LoginReminder = styled.span`
  font-size: 0.75em;
  color: var(--htx);
`;

const LoginInput = styled.input`
  margin: 3px 0 10px 0;

  border: none;

  background-color: var(--hdr);
  color: var(--txt);
  font-family: Terminus, Montserrat;
  font-size: 1.2em;

  &:focus {
    outline: none;
  }
`;

const LoginUsernameInput = styled(LoginInput).attrs({
  type: 'text',
  name: 'username',
})``;

const LoginPasswordInput = styled(LoginInput).attrs({
  type: 'password',
  name: 'password',
})``;

const LoginButton = styled.input.attrs({ type: 'submit', value: 'Login' })`
  display: none;
`;

export function LoginPanel() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setLogUser } = useLogin();
  const { loginError, setLoginError } = useLoginError();

  return (
    <LoginForm
      onSubmit={(e) => {
        e.preventDefault();
        fetch(`${TASKS_API_URL}/login/`, {
          method: 'post',
          credentials: 'same-origin',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user: username,
            pass: password,
          }),
        })
          .then((res) => {
            if (!res.ok || res.status !== 204)
              throw new Error('failed to login');
            if (res.status === 204) {
              // must set loginerror before loguser to prevent
              // the error where an unmounted component cannot
              // update state
              setLoginError(null);
              setLogUser(username);
            }
          })
          .catch(() => {
            setLoginError('true');
          });
      }}
    >
      <LoginFailedWarning failed={loginError !== null}>
        Login failed, please try again
      </LoginFailedWarning>
      Username
      <LoginUsernameInput onChange={(e) => setUsername(e.target.value)} />
      Password
      <LoginPasswordInput onChange={(e) => setPassword(e.target.value)} />
      <LoginReminder>Press enter to log in</LoginReminder>
      <LoginButton />
    </LoginForm>
  );
}
