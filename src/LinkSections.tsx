import { useCallback, useEffect, useState } from 'react';
import validator from 'validator';
import { Sites, option, SITES_DATA_URL } from './config';
import { getValidURL } from './util';

function Section({
  title,
  children,
}: {
  title: string;
  children: JSX.Element[];
}) {
  return children.length ? (
    <div id={title} className={'section'}>
      {title}
      <div>{children}</div>
    </div>
  ) : (
    <></>
  );
}

export default function LinkSections({
  query,
  setAction,
}: {
  query: string;
  setAction: (s: option<string>) => void;
}) {
  const [sites, setSites] = useState<option<Sites>>(null);
  const [sections, setSections] = useState<JSX.Element[]>([]);
  const [selected, setSelected] = useState<option<number>>(null);
  const [totalMatched, setTotalMatched] = useState(0);

  useEffect(() => {
    fetch(SITES_DATA_URL)
      .then((res) => res.json())
      .then((data) => {
        setSites(data);
        document.documentElement.style.setProperty(
          '--max-links',
          `${Math.max(
            ...Object.keys(data).map(
              (category) => Object.keys(data[category]).length,
            ),
          )}`,
        );
      })
      .catch((err) => console.log(err));
  }, []);

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
                  <a
                    key={idx}
                    href={getValidURL(links[name])}
                    className={isSelected ? 'selected' : ''}
                  >
                    {name}
                  </a>
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
    if (validator.isURL(query)) {
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

  return <div id={'links'}>{sections}</div>;
}
