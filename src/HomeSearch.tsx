import { useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { option } from './config';
import LinkSections from './LinkSections';
import SearchBar from './SearchBar';
import StaticLinks from './StaticLinks';

export default function HomeSearch() {
  const [query, setQuery] = useState('');
  const [action, setAction] = useState<option<string>>(null);
  const { height: spanHeight, ref } = useResizeDetector();

  return (
    //  We explicitly set the height of div#main so
    //  the height transition is animated
    <div id={'main'} style={{ height: spanHeight }}>
      <span ref={ref} style={{ display: 'block' }}>
        <StaticLinks />
        <SearchBar text={query} setText={setQuery} action={action} />
        <LinkSections query={query} setAction={setAction} />
      </span>
    </div>
  );
}
