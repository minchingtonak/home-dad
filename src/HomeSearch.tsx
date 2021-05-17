import { useEffect, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { option } from './config';
import LinkSections from './LinkSections';
import SearchBar from './SearchBar';
import StaticLinks from './StaticLinks';
import styled from 'styled-components';

const MainContainer = styled.div`
  // transition: 0.2s height;

  max-width: 912px;

  user-select: none;
  text-align: center;
`;

export default function HomeSearch() {
  const [query, setQuery] = useState('');
  const [action, setAction] = useState<option<string>>(null);
  const { height, ref } = useResizeDetector();

  useEffect(() => {
    if (
      height !== undefined &&
      height >
        parseInt(
          getComputedStyle(document.documentElement)
            .getPropertyValue('--homesearch-height')
            .slice(0, -2),
        )
    )
      document.documentElement.style.setProperty(
        '--homesearch-height',
        `${height}px`,
      );
  }, [height]);

  return (
    <MainContainer id="main" ref={ref}>
      <StaticLinks />
      <SearchBar text={query} setText={setQuery} action={action} />
      <LinkSections query={query} setAction={setAction} />
    </MainContainer>
  );
}
