import { useCallback, useEffect } from 'react';
import { option } from './config';

export default function SearchBar({
  text,
  setText,
  action,
}: {
  text: string;
  setText: (s: string) => void;
  action: option<string>;
}) {
  const updateTitle = useCallback(
    (start: string) => {
      if (text.length) document.title = `${start} - ${text}`;
      else document.title = '🏠 Home';
    },
    [text],
  );

  useEffect(() => {
    updateTitle('🔍');
  }, [text, updateTitle]);

  useEffect(() => {
    const blurCallback = updateTitle.bind(null, '📝'),
      focusCallback = updateTitle.bind(null, '🔍');

    window.addEventListener('blur', blurCallback);
    window.addEventListener('focus', focusCallback);

    return () => {
      window.removeEventListener('blur', blurCallback);
      window.removeEventListener('focus', focusCallback);
    };
  }, [updateTitle]);

  return (
    <form id={'action'} action={action !== null ? action : 'https://google.com/search'}>
      <input
        type="text"
        value={text}
        autoFocus
        autoComplete={'off'}
        name={action !== null ? '' : 'q'}
        onChange={(e) => setText(e.target.value)}
      />
    </form>
  );
}
