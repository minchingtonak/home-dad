import { useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { option } from './config';
import LinkSections from './LinkSections';
import SearchBar from './SearchBar';
import StaticLinks from './StaticLinks';
import styled from 'styled-components';

type MainContainerProps = {
  order: number;
  height?: number;
};

const MainContainer = styled.div<MainContainerProps>`
  position: relative;
  order: ${(props) => props.order || 0};

  transition: 0.2s height;

  max-height: 90vh;
  max-width: 912px;

  user-select: none;
  text-align: center;
`;

const Wrapper = styled.span`
  display: block;
`;

export default function HomeSearch() {
  const [query, setQuery] = useState('');
  const [action, setAction] = useState<option<string>>(null);
  const { height: spanHeight, ref } = useResizeDetector();

  return (
    //  We explicitly set the height of div#main so
    //  the height transition is animated
    <MainContainer id="main" order={0} style={{height: spanHeight}}>
      <Wrapper ref={ref}>
        <StaticLinks />
        <SearchBar text={query} setText={setQuery} action={action} />
        <LinkSections query={query} setAction={setAction} />
      </Wrapper>
    </MainContainer>
  );
}
