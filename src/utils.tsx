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

type Arr = readonly unknown[];
export function partial<T extends Arr, U extends Arr, R>(
  f: (...args: [...T, ...U]) => R,
  ...headArgs: T
) {
  return (...tailArgs: U) => f(...headArgs, ...tailArgs);
}

export function getValidURL(link: string): string {
  return link.match(/^https?:\/\//) !== null ? link : `//${link}`;
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
    color: txtcolor,
  },
  underline: {
    '&:before': {
      borderBottom: `1px solid ${linecolor}`,
    },
    '&:hover:not($disabled):not($focused):not($error):before': {
      borderBottom: `2px solid ${linecolor}`,
    },
    '&:after': {
      borderBottom: `3px solid ${linecolor}`,
    },
  },
  disabled: {},
  focused: {},
  error: {},
});

// If you're windering why everything in this theme is !important,
// I am too :). Calendar styling doesn't show up correctly in production
// build unless !important is used. I know this probably indicates a bigger
// issue, but I don't want to spend more time on this issue right now.
// Other possible paths - bundle analyzer or try Vite
export const dateTimePickerTheme = createMuiTheme(
  {
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
          backgroundColor: 'var(--hdr) !important',
          color: 'var(--txt) !important',
          margin: '0 5px !important',
        },
        switchHeader: {
          backgroundColor: 'var(--frg) !important',
          color: 'var(--txt) !important',
        },
        daysHeader: {
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
          backgroundColor: 'var(--htx) !important',
          '&:hover': {
            backgroundColor: 'var(--htx) !important',
          },
        },
        dayDisabled: {
          color: 'var(--htx) !important',
        },
        current: {
          color: 'var(--txt) !important',
        },
      },
      MuiPickersModal: {
        dialogAction: {
          color: 'red !important',
        },
      },
      MuiPickersClock: {
        clock: {
          backgroundColor: 'var(--hdr) !important',
        },
        pin: {
          backgroundColor: 'var(--htx) !important',
        },
      },
      MuiPickersClockNumber: {
        clockNumber: {
          color: 'var(--txt) !important',
        },
        clockNumberSelected: {
          backgroundColor: 'var(--htx) !important',
        },
      },
      MuiPickersClockPointer: {
        pointer: {
          backgroundColor: 'var(--htx) !important',
        },
        thumb: {
          borderColor: '#00000000 !important',
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
  },
);

export const HomeInput = withStyles(inputStyles('var(--txt)', 'var(--txt)'), {
  index: 1,
})((props: InputProps) => <Input {...props} />);

export function HomeDateTimePicker(props: DateTimePickerProps) {
  return (
    <MuiPickersUtilsProvider utils={DayJsUtils}>
      <ThemeProvider theme={dateTimePickerTheme}>
        <DateTimePicker {...props} />
      </ThemeProvider>
    </MuiPickersUtilsProvider>
  );
}
