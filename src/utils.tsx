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
import { StylesProvider } from '@material-ui/core/styles';
import DayJsUtils from '@date-io/dayjs';

export function getValidURL(link: string): string {
  return link.match(/^https?:\/\//) !== null ? link : `//${link}`;
}

