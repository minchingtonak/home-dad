import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_SEARCH_URL,
  DEFAULT_TAB_TITLE,
  NOTE_TAB_PREFIX,
  option,
  SEARCH_TAB_PREFIX,
} from './config';
import { getValidURL } from './utils';
import styled from 'styled-components';

const SearchInput = styled.input`
  margin: 0px 2px 2px 2px;
  padding-left: 5px;
  box-sizing: border-box;

  border: none;
  width: var(--lwidth);
  height: 50px;

  font-size: 40px;
  background-color: var(--frg);
  color: var(--txt);

  &:focus {
    outline: none;
  }

  @media screen and (max-width: 912px) {
    & {
      width: var(--mwidth);
    }
  }

  @media screen and (max-width: 608px) {
    & {
      width: var(--swidth);
    }
  }
`;

export default function SearchBar({
  text,
  setText,
  action,
}: {
  text: string;
  setText: (s: string) => void;
  action: option<string>;
}) {
  const input = useRef<HTMLInputElement>(null);

  // useEffect(() => {
  //   // Clikcing on anything except a link will focus the search bar
  //   (document.querySelector('body') as HTMLBodyElement).onclick = (e) => {
  //     if (input && input.current) input.current.focus();
  //   };
  // }, [input]);

  const updateTitle = useCallback(
    (start: string) => {
      if (text.length) document.title = `${start} - ${text}`;
      else document.title = DEFAULT_TAB_TITLE;
    },
    [text],
  );

  useEffect(() => {
    updateTitle(SEARCH_TAB_PREFIX);
  }, [text, updateTitle]);

  useEffect(() => {
    const blurCallback = updateTitle.bind(null, NOTE_TAB_PREFIX),
      focusCallback = updateTitle.bind(null, SEARCH_TAB_PREFIX);

    window.addEventListener('blur', blurCallback);
    window.addEventListener('focus', focusCallback);

    return () => {
      window.removeEventListener('blur', blurCallback);
      window.removeEventListener('focus', focusCallback);
    };
  }, [updateTitle]);

  const [ctrlPressed, setCtrlPressed] = useState(false);

  useEffect(() => {
    function toggle(e: KeyboardEvent) {
      if (e.key === 'Control') setCtrlPressed(!ctrlPressed);
    }
    document.addEventListener('keydown', toggle);
    document.addEventListener('keyup', toggle);

    return () => {
      document.removeEventListener('keydown', toggle);
      document.removeEventListener('keyup', toggle);
    };
  }, [ctrlPressed]);

  return (
    <form
      id={'action'}
      onSubmit={(e) => {
        e.preventDefault();
        // TODO - code to handle todo list commands
        window.location.assign(
          action !== null
            ? getValidURL(action)
            : `${DEFAULT_SEARCH_URL}?q=${text}`,
        );
      }}
    >
      <SearchInput
        type="text"
        value={text}
        ref={input}
        autoFocus
        autoComplete="off"
        onChange={(e) => {
          // console.log(e.target.value);
          setText(e.target.value);
        }}
      />
    </form>
  );
}
