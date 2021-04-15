import Clock from './Clock';

function StaticLinks() {
  const links = ['Spotify', 'Slack', 'Steam'];

  return (
    <div id={'static-links'}>
      <Clock />
      {links.map((link, idx) => (
        <a key={idx} href={link.toLowerCase() + ':'}>
          {link}
        </a>
      ))}
    </div>
  );
}

export default StaticLinks;
