import styled from 'styled-components';
import { useGoogleAPI } from './auth';

const LoginButton = styled.button`
  padding: 5px;

  border: none;

  &:focus {
    outline: none;
  }

  background-color: var(--hdr);
  color: var(--txt);
`;

export function LoginPanel() {
  const { loggedIn, logIn, logOut } = useGoogleAPI();

  return (
    <LoginButton onClick={loggedIn ? () => logOut() : () => logIn()}>
      {loggedIn ? 'Log out' : 'Log in'}
    </LoginButton>
  );
}
