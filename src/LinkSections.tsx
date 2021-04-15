import { useEffect, useState } from 'react';
import { option } from './config';
import linkdata_json from './sites.json';

const linkdata = linkdata_json as { [k: string]: { [k: string]: string } };

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
  const [sections, setSections] = useState<JSX.Element[]>([]);
  const [selected, setSelected] = useState<option<number>>(null);
  const [totalMatched, setTotalMatched] = useState(0);
  const [prevQuery, setPrevQuery] = useState(query);

  useEffect(() => {
    // runs on query change - set selected back to 0 if query or null if empty query
    // runs on selected change - just rerender with selected link updated
    console.log(`${query}, ${prevQuery}`);
    if (query.length && query === prevQuery) {
      console.log('arrow');
    } else {
      setPrevQuery(query);
      // Assemble list of sections based on query
      const newSections: JSX.Element[] = [];
      const newSelected: option<number> = query.length ? 0 : null;
      let pos = 0,
        matches = false;
      Object.keys(linkdata).forEach((category, idx) => {
        const links = linkdata[category];
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
    }
  }, [query, prevQuery, setAction]);

  useEffect(() => {
    console.log('keyboard event effect');
    function onKeyDown(e: KeyboardEvent) {
      console.log(sections);
      let newSelected = selected;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        if (selected !== null && selected > 0) {
          newSelected = selected - 1;
        }
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        if (selected !== null && selected < totalMatched) {
          newSelected = selected + 1;
        }
      }
      if (newSelected === selected) return;
      // update current sections to set new selected classname to selected
      let pos = 0;
      const updated = sections.map((section, idx) => (
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
      ));
      setSections(updated);
      setSelected(newSelected);
    }
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [setAction, selected, totalMatched, sections]);

  return <div id={'links'}>{sections}</div>;
}
