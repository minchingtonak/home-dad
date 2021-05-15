import Clock from './Clock';
import styled from 'styled-components';

const StaticLinksContainer = styled.div`
  margin: 2px 2px 0 2px;
  box-sizing: border-box;

  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  align-items: center;

  padding: 0 5px;
  width: var(--lwidth);

  background-color: var(--hdr);

  color: var(--txt);
  font-size: 16px;
  line-height: 30px;
  text-align: center;

  @media screen and (max-width: 912px) {
    & {
      width: var(--mwidth);
      margin: 2px auto 0 auto;
    }
  }

  @media screen and (max-width: 608px) {
    & {
      width: var(--swidth);
    }
  }
`;

const StaticLink = styled.a`
  color: var(--htx);
  text-decoration: none;

  &:hover {
    color: var(--txt);
  }

  & + & {
    margin-left: 15px;
  }

  @media screen and (max-width: 608px) {
    &:first-of-type {
      margin-left: 110px;
    }
  }
`;

export default function StaticLinks() {
  const links = ['Spotify', 'Slack', 'Steam'];

  return (
    <StaticLinksContainer id="static-links">
      <Clock />
      {links.map((link, idx) => (
        <StaticLink key={idx} href={link.toLowerCase() + ':'}>
          {link}
        </StaticLink>
      ))}
    </StaticLinksContainer>
  );
}
