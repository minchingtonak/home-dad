import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  CheckboxProps,
  Checkbox,
  InputProps,
  Input,
  ThemeProvider,
  withStyles,
  createMuiTheme,
} from '@material-ui/core';
import {
  DatePicker,
  DatePickerProps,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import DayJsUtils from '@date-io/dayjs';
import qs from 'querystring';
import create from 'zustand';
import { Task } from './config';

type Arr = readonly unknown[];
export function partial<T extends Arr, U extends Arr, R>(
  f: (...args: [...T, ...U]) => R,
  ...headArgs: T
) {
  return (...tailArgs: U) => f(...headArgs, ...tailArgs);
}

export function getValidURL(link: string): string {
  return /^https?:\/\//.test(link) ? link : `//${link}`;
}

const ls = window.localStorage;

export function useCached<T>(
  key: string,
  defaultValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [data, setData] = useState<T>(() => {
    const cached = ls.getItem(key);
    return cached !== null ? JSON.parse(cached) : defaultValue;
  });

  useEffect(() => {
    ls.setItem(key, JSON.stringify(data));
  }, [data, key]);

  return [data, setData];
}

function parseQueryString(queryString = window.location.search) {
  const values = qs.parse(queryString);

  // Remove leading qmark from first query param
  const qmarkKey = Object.keys(values).find((elt) => elt.startsWith('?'));
  if (qmarkKey) {
    const tmp = values[qmarkKey];
    delete values[qmarkKey];
    values[qmarkKey.slice(1)] = tmp;
  }
  return values;
}

function setQueryString(key: string, value: any) {
  const parsed = parseQueryString();
  if (key in parsed && !value) delete parsed[key];
  else parsed[key] = value;

  const newurl =
    window.location.protocol +
    '//' +
    window.location.host +
    window.location.pathname +
    `${Object.keys(parsed).length ? '?' : ''}${qs.stringify(parsed)}`;

  window.history.pushState({ path: newurl }, '', newurl);
}

function getQueryStringValue(key: string) {
  return parseQueryString()[key];
}

export function useQueryString(key: string, initialValue: any) {
  const [value, setValue] = useState(getQueryStringValue(key) || initialValue);
  const onSetValue = useCallback(
    (newValue) => {
      setValue(newValue);
      setQueryString(key, newValue);
    },
    [key],
  );

  return [value, onSetValue];
}

export const HomeCheckbox = withStyles(
  {
    root: {
      color: 'var(--txt)',
      '&$checked': {
        color: 'var(--txt)',
      },
    },
    checked: {},
  },
  { index: 1 },
)((props: CheckboxProps) => <Checkbox color="default" {...props} />);

export const inputStyles = (txtcolor: string, linecolor: string) => ({
  root: {
    color: `${txtcolor} !important`,
    '&$error': {
      '&:before': {
        borderBottom: '1px solid red !important',
      },
      '&:after': {
        borderBottom: '3px solid red !important',
      },
    },
  },
  underline: {
    '&:before': {
      borderBottom: `1px solid ${linecolor} !important`,
    },
    '&:hover:not($disabled):not($focused):not($error):before': {
      borderBottom: `2px solid ${linecolor} !important`,
    },
    '&:after': {
      borderBottom: `3px solid ${linecolor} !important`,
    },
  },
  disabled: {},
  focused: {},
  error: {},
});

// If you're wondering why everything in this theme is !important,
// I am too :). Calendar styling doesn't show up correctly in production
// build unless !important is used. I know this probably indicates a bigger
// issue, but I don't want to spend more time on this issue right now.
// Other possible paths - bundle analyzer or try Vite
export const dateTimePickerTheme = createMuiTheme({
  overrides: {
    MuiInput: inputStyles('var(--htx)', 'var(--htx)'),
    MuiPaper: {
      root: {
        border: '3px solid var(--frg) !important',
      },
      rounded: {
        borderRadius: '0 !important',
        backgroundColor: 'var(--frg) !important',
      },
    },
    MuiPickersToolbar: {
      toolbar: {
        backgroundColor: 'var(--hdr) !important',
      },
    },
    MuiPickersCalendarHeader: {
      iconButton: {
        color: 'var(--txt) !important',
        backgroundColor: 'var(--hdr) !important',
        margin: '0 5px !important',
      },
      switchHeader: {
        color: 'var(--txt) !important',
        backgroundColor: 'var(--frg) !important',
      },
      daysHeader: {
        color: 'var(--txt) !important',
        backgroundColor: 'var(--frg) !important',
      },
      dayLabel: {
        color: 'var(--txt) !important',
      },
    },
    MuiPickersDay: {
      day: {
        color: 'var(--txt) !important',
        backgroundColor: 'var(--frg) !important',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.1) !important',
        },
      },
      daySelected: {
        color: 'var(--txt) !important',
        backgroundColor: 'var(--hdr) !important',
        '&:hover': {
          backgroundColor: 'var(--bkg) !important',
        },
      },
      dayDisabled: {
        color: 'var(--htx) !important',
      },
      current: {
        color: 'var(--txt) !important',
      },
    },
    MuiPickersClock: {
      clock: {
        backgroundColor: 'var(--hdr) !important',
      },
      pin: {
        backgroundColor: 'var(--frg) !important',
      },
    },
    MuiPickersClockNumber: {
      clockNumber: {
        color: 'var(--txt) !important',
      },
      clockNumberSelected: {
        backgroundColor: 'var(--frg) !important',
      },
    },
    MuiPickersClockPointer: {
      pointer: {
        backgroundColor: 'var(--frg) !important',
      },
      thumb: {
        borderColor: '#00000000 !important',
        backgroundColor: 'var(--frg) !important',
      },
      noPoint: {
        backgroundColor: '#00000000 !important',
      },
    },
    MuiPickersYear: {
      root: {
        color: 'var(--htx) !important',
      },
      yearSelected: {
        color: 'var(--txt) !important',
      },
    },
  },
});

export const HomeMaterialInput = withStyles(
  inputStyles('var(--txt)', 'var(--txt)'),
  {
    index: 1,
  },
)((props: InputProps) => <Input {...props} />);

export function HomeDatePicker(props: DatePickerProps) {
  return (
    <MuiPickersUtilsProvider utils={DayJsUtils}>
      <ThemeProvider theme={dateTimePickerTheme}>
        <DatePicker {...props} />
      </ThemeProvider>
    </MuiPickersUtilsProvider>
  );
}

// Context stuff

export const useLogin = create<{
  loggedIn: boolean;
  setLoggedIn: (val: boolean) => void;
}>((set) => ({
  loggedIn: false,
  setLoggedIn: (val) => set({ loggedIn: val }),
}));

type AddTask = (t: Task) => void;
export const useAddTask = create<{
  addTask: AddTask;
  setAddTask: (a: AddTask) => void;
}>((set) => ({
  addTask: () => {},
  setAddTask: (a) => set({ addTask: a }),
}));
