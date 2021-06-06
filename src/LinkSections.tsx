import { useCallback, useEffect, useState } from 'react';
import isURL from 'validator/lib/isURL';
import { Sites, option, SITES_DATA_URL } from './config';
import { getValidURL, useCached } from './utils';
import styled from 'styled-components';

const SectionContainer = styled.div`
  vertical-align: top;

  display: inline-block;

  overflow: hidden;

  box-sizing: border-box;
  margin: 2px;
  height: var(--section-height);
  width: var(--section-width);

  background-color: var(--hdr);

  text-align: left;
  color: var(--htx);

  &:before {
    content: '';
    margin-left: 5px;
  }
`;

const LinksWrapper = styled.div`
  padding: 10px 15px 15px 10px;

  height: 100%;

  background-color: var(--frg);
`;

function Section({
  title,
  children,
}: {
  title: string;
  children: JSX.Element[];
}) {
  return children.length ? (
    <SectionContainer id={title}>
      {title}
      <LinksWrapper>{children}</LinksWrapper>
    </SectionContainer>
  ) : (
    <></>
  );
}

const Link = styled.a`
  margin-bottom: var(--link-margin);
  padding-left: 5px;

  display: block;

  color: var(--txt);
  text-decoration: none;

  &:hover,
  &.selected {
    background-color: rgba(255, 255, 255, 0.05);

    color: var(--hgl);
  }
`;

export default function LinkSections({
  query,
  setAction,
}: {
  query: string;
  setAction: (s: option<string>) => void;
}) {
  const [sites, setSites] = useCached<option<Sites>>('sites', null);
  const [sections, setSections] = useState<JSX.Element[]>([]);
  const [selected, setSelected] = useState<option<number>>(null);
  const [totalMatched, setTotalMatched] = useState(0);

  useEffect(() => {
    fetch(SITES_DATA_URL)
      .then((res) => res.json())
      .then((data) => setSites(data))
      .catch((err) => console.error(err));
  }, [setSites]);

  useEffect(() => {
    if (sites !== null)
      document.documentElement.style.setProperty(
        '--max-links',
        `${Math.max(
          ...Object.keys(sites).map(
            (category) => Object.keys(sites[category]).length,
          ),
        )}`,
      );
  }, [sites]);

  const updateSections = useCallback(
    function (newSelected: option<number>) {
      if (sites === null) return;

      const newSections: JSX.Element[] = [];
      let pos = 0,
        matches = false;
      Object.keys(sites).forEach((category, idx) => {
        const links = sites[category];
        const filtered = Object.keys(links).filter((name) =>
          name.toLowerCase().includes(query),
        );

        if (filtered.length) {
          matches = true;
          newSections.push(
            <Section key={idx} title={category}>
              {filtered.map((name, idx) => {
                const isSelected = pos++ === newSelected;
                if (isSelected) setAction(links[name]);

                return (
                  <Link
                    key={idx}
                    href={getValidURL(links[name])}
                    className={isSelected ? 'selected' : ''}
                  >
                    {name}
                  </Link>
                );
              })}
            </Section>,
          );
        }
      });
      setTotalMatched(pos);
      setSections(newSections);
      setSelected(newSelected);
      if (!matches || !query.length) setAction(null);
    },
    [query, sites, setAction],
  );

  useEffect(() => {
    if (
      isURL(query) ||
      /^(https?)?:\/\/localhost:\d{1,5}([^\d].*)?$/g.test(query)
    ) {
      setAction(query);
      return;
    }
    if (
      query.match(/^lh\d{3,5}$/) !== null ||
      query.match(/^localhost:\d{3,5}$/) !== null
    ) {
      setAction(
        `http://localhost:${(query.match(/\d{3,5}/) as RegExpMatchArray)[0]}`,
      );
      return;
    }
    // Assemble list of sections based on query
    updateSections(query.length ? 0 : null);
  }, [query, setAction, updateSections]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      let newSelected = selected;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        if (selected !== null && selected > 0) newSelected = selected - 1;
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        if (selected !== null && selected < totalMatched)
          newSelected = selected + 1;
      }
      if (newSelected !== selected) updateSections(newSelected);
    }
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [selected, totalMatched, updateSections]);

  return <div id="links">{sections}</div>;
}
