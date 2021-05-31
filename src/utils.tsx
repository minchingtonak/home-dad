import {
  createContext,
  Dispatch,
  ReactElement,
  SetStateAction,
  useContext,
  useEffect,
  useReducer,
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
  DateTimePicker,
  DateTimePickerProps,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import DayJsUtils from '@date-io/dayjs';
import { NewTask } from './config';

type Arr = readonly unknown[];
export function partial<T extends Arr, U extends Arr, R>(
  f: (...args: [...T, ...U]) => R,
  ...headArgs: T
) {
  return (...tailArgs: U) => f(...headArgs, ...tailArgs);
}

export function getValidURL(link: string): string {
  return /^https?:\/\//.test(link) !== null ? link : `//${link}`;
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

// export function useQuery(key: string): {
//   param: option<string>;
//   setParam: Dispatch<SetStateAction<option<string>>>;
// } {
//   const [param, setParam] = useState<option<string>>(() => {
//     const queryParams = new URLSearchParams(window.location.search);
//     return queryParams.has(key) ? queryParams.get(key) : null;
//   });

//   useEffect(() => {
//     const queryParams = new URLSearchParams(window.location.search);
//     const set = param !== null;

//     if (set) queryParams.set(key, param as string);
//     else queryParams.delete(key);

//     window.history.replaceState(
//       null,
//       key,
//       `?${queryParams.toString()}${window.location.hash}`,
//     );
//   }, [param, key]);

//   return { param, setParam };
// }

// export function useLoginError() {
//   const [data, setData] = useCached<option<string>>('loginerror', null);
//   return { loginError: data, setLoginError: setData };
// }

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

export function HomeDateTimePicker(props: DateTimePickerProps) {
  return (
    <MuiPickersUtilsProvider utils={DayJsUtils}>
      <ThemeProvider theme={dateTimePickerTheme}>
        <DateTimePicker {...props} />
      </ThemeProvider>
    </MuiPickersUtilsProvider>
  );
}

// Context stuff

type LoginContextType = {
  loggedIn: boolean;
  setLoggedIn: Dispatch<boolean>;
};

export const LoginContext = createContext<LoginContextType>({
  loggedIn: false,
  setLoggedIn: () => {},
});

export function LoginStore({
  children,
}: {
  children: ReactElement | ReactElement[];
}) {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    console.log('loggedIn', loggedIn);
  }, [loggedIn]);

  return (
    <LoginContext.Provider
      value={{ loggedIn: loggedIn, setLoggedIn: setLoggedIn }}
    >
      {children}
    </LoginContext.Provider>
  );
}

export const useLogin = () => useContext(LoginContext);

type AddTask = (t: NewTask) => void;
type AddTaskContextType = {
  addTask: AddTask;
  setAddTask: Dispatch<AddTask>;
};

export const AddTaskContext = createContext<AddTaskContextType>({
  addTask: (t: NewTask) => {},
  setAddTask: () => {},
});

export function AddTaskStore({
  children,
}: {
  children: ReactElement | ReactElement[];
}) {
  const [state, dispatch] = useReducer(
    (_: AddTask, a: AddTask) => a,
    (t: NewTask) => {},
  );

  return (
    <AddTaskContext.Provider value={{ addTask: state, setAddTask: dispatch }}>
      {children}
    </AddTaskContext.Provider>
  );
}

export const useAddTask = () => useContext(AddTaskContext);
