import { useEffect, useState } from 'react';
import validator from 'validator';
import { json, option } from './config';

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
  const [sites, setSites] = useState<option<json>>(null);
  const [sections, setSections] = useState<JSX.Element[]>([]);
  const [selected, setSelected] = useState<option<number>>(null);
  const [totalMatched, setTotalMatched] = useState(0);

  useEffect(() => {
    fetch(
      'https://gist.githubusercontent.com/minchingtonak/b60356be980dc4f430fe73b523d1fafb/raw',
    )
      .then((res) => res.json())
      .then((data) => setSites(data))
      .catch((err) => console.error(err));
  }, []);

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
    if (sites === null) return;
    // Assemble list of sections based on query
    const newSections: JSX.Element[] = [];
    const newSelected: option<number> = query.length ? 0 : null;
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
                  href={links[name]}
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
  }, [sites, query, setAction]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      let newSelected = selected;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        if (selected !== null && selected > 0) newSelected = selected - 1;
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        if (selected !== null && selected < totalMatched)
          newSelected = selected + 1;
      }
      if (newSelected === selected) return;
      // update current sections to set new selected classname to selected
      let pos = 0;
      setSections(
        sections.map((section, idx) => (
          <Section key={idx} title={section.props.title}>
            {'children' in section.props ? (
              section.props.children.map((child: JSX.Element, idx: number) => {
                const isSelected = pos++ === newSelected;
                if (isSelected) setAction(child.props.href);

                return (
                  <a
                    key={idx}
                    href={child.props.href}
                    className={isSelected ? 'selected' : ''}
                  >
                    {child.props.children}
                  </a>
                );
              })
            ) : (
              <></>
            )}
          </Section>
        )),
      );
      setSelected(newSelected);
    }
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [setAction, selected, totalMatched, sections]);

  return <div id={'links'}>{sections}</div>;
}
