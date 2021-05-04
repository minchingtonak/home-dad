import {
  Task,
  TASKS_API_URL,
  TASK_DELETE_DELAY,
  TASK_UPDATE_DELAY,
} from './config';
import update from 'immutability-helper';
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
import { ChangeEventHandler, useState } from 'react';
// import {
//   HomeCheckbox,
//   HomeDateTimePicker,
//   HomeInput,
// } from './utils';

export const HomeCheckbox = withStyles(
  {
    root: {
      color: '#a6a6a6',
      '&$checked': {
        color: '#a6a6a6',
      },
    },
    checked: {},
  },
  { index: 1 },
)((props: CheckboxProps) => <Checkbox color="default" {...props} />);

export const inputStyles = {
  root: {
    color: '#a6a6a6',
  },
  underline: {
    '&:before': {
      borderBottom: '1px solid #a6a6a6',
    },
    '&:hover:not($disabled):not($focused):not($error):before': {
      borderBottom: '2px solid #a6a6a6',
    },
    '&:after': {
      borderBottom: '3px solid #a6a6a6',
    },
  },
  disabled: {},
  focused: {},
  error: {},
};

export const dateTimePickerTheme = createMuiTheme({
  overrides: {
    MuiInput: inputStyles,
    MuiPaper: {
      root: {
        border: '3px solid var(--frg)',
      },
      rounded: {
        borderRadius: '0',
        backgroundColor: 'var(--frg)',
      },
    },
    MuiPickersToolbar: {
      toolbar: {
        backgroundColor: 'var(--hdr)',
      },
    },
    MuiPickersCalendarHeader: {
      iconButton: {
        backgroundColor: 'var(--hdr)',
        color: 'var(--txt)',
        margin: '0 5px',
      },
      switchHeader: {
        backgroundColor: 'var(--frg)',
        color: 'var(--txt)',
      },
      daysHeader: {
        backgroundColor: 'var(--frg)',
      },
      dayLabel: {
        color: 'var(--txt)',
      },
    },
    MuiPickersDay: {
      day: {
        color: 'var(--txt)',
        backgroundColor: 'var(--frg)',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
      },
      daySelected: {
        backgroundColor: 'var(--htx)',
        '&:hover': {
          backgroundColor: 'var(--txt)',
        },
      },
      dayDisabled: {
        color: 'var(--htx)',
      },
      current: {
        color: 'var(--txt)',
      },
    },
    MuiPickersModal: {
      dialogAction: {
        color: 'red',
      },
    },
    MuiPickersClock: {
      clock: {
        backgroundColor: 'var(--hdr)',
      },
      pin: {
        backgroundColor: 'var(--htx)',
      },
    },
    MuiPickersClockNumber: {
      clockNumber: {
        color: 'var(--txt)',
      },
      clockNumberSelected: {
        backgroundColor: 'var(--htx)',
      },
    },
    MuiPickersClockPointer: {
      pointer: {
        backgroundColor: 'var(--htx)',
      },
      thumb: {
        borderColor: '#00000000',
      },
      noPoint: {
        backgroundColor: '#00000000',
      },
    },
    MuiPickersYear: {
      root: {
        color: 'var(--htx)',
      },
      yearSelected: {
        color: 'var(--txt)',
      },
    },
  },
});

export const HomeInput = withStyles(
  {
    ...inputStyles,
  },
  { index: 1 },
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

function TaskEntry({
  task,
  setTask,
  checked,
  setChecked,
  setDeleted,
}: {
  task: Task;
  setTask: (t: Partial<Task>) => void;
  checked: boolean;
  setChecked: ChangeEventHandler;
  setDeleted: () => void;
}) {
  return (
    <div>
      <HomeCheckbox checked={checked} onChange={setChecked} />
      <div>
        <HomeInput
          error={task.text === ''}
          value={task.text}
          onChange={(e) => setTask({ text: e.target.value })}
        />
        <span id="due">
          <i className="fas fa-clock"></i>
          <MuiPickersUtilsProvider utils={DayJsUtils}>
            <ThemeProvider theme={dateTimePickerTheme}>
              <DateTimePicker
                variant="inline"
                autoOk
                ampm={false}
                hideTabs={true}
                value={task.due}
                format={'ddd, MMM D [at] H:mm'}
                onChange={(d) => setTask({ due: d?.toDate() })}
              />
            </ThemeProvider>
          </MuiPickersUtilsProvider>
        </span>
      </div>
      <i className="fas fa-trash fa-lg" onClick={setDeleted}></i>
    </div>
  );
}

export function TasksList({
  tasks,
  setTasks,
}: {
  tasks: Task[];
  setTasks: (t: Task[]) => void;
}) {
  const [updateTimer, setUpdateTimer] = useState<number | undefined>(undefined);
  const [toBeUpdated, setToBeUpdated] = useState<{
    [k: string]: Partial<Task>;
  }>({});

  function updateTask(idx: number, t: Partial<Task>) {
    // update local tasks list
    const updated = update(tasks, {
      [idx]: { $merge: t },
    });

    setTasks(updated);
    const { createdAt, updatedAt, ...updatedTask } = updated[idx];

    // add change to to be updated buffer to be sent to server
    const newToBeUpdated =
      updatedTask._id in toBeUpdated
        ? update(toBeUpdated, {
            [updatedTask._id]: { $merge: updatedTask },
          })
        : { ...toBeUpdated, [updatedTask._id]: updatedTask };
    setToBeUpdated(newToBeUpdated);

    // reset countdown to sending update data
    clearTimeout(updateTimer);

    if (updatedTask.text === '') return;
    setUpdateTimer(
      window.setTimeout(() => {
        fetch(TASKS_API_URL, {
          method: 'PATCH',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            Object.keys(newToBeUpdated).map((id) => newToBeUpdated[id]),
          ),
        })
          .then((res) => res.json())
          .then((data) => {
            const l = Object.keys(newToBeUpdated).length;
            if (data.updated !== l) {
              console.error(
                `failed to update  all tasks: ${data.updated} of ${l} were updated`,
              );
              return;
            }
            setToBeUpdated({});
          })
          .catch((e) => console.log(e));
      }, TASK_UPDATE_DELAY),
    );
  }

  const [deleteTimer, setDeleteTimer] = useState<number | undefined>(undefined);
  const [toDelete, setToDelete] = useState<string[]>([]);

  function deleteTask(idx: number) {
    const updated = update(tasks, { $splice: [[idx, 1]] });
    setTasks(updated);

    const newToDelete = [...toDelete, tasks[idx]._id];
    setToDelete(newToDelete);

    clearTimeout(deleteTimer);
    setDeleteTimer(
      window.setTimeout(() => {
        fetch(TASKS_API_URL, {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newToDelete),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.deleted !== newToDelete.length) {
              console.error(
                `failed to delete all tasks: ${data.deleted} of ${newToDelete.length} were deleted`,
              );
              return;
            }
            setToDelete([]);
          })
          .catch((e) => console.log(e));
      }, TASK_DELETE_DELAY),
    );
  }

  return (
    <div id="taskslist">
      {tasks.length ? (
        tasks
          // .filter((t) => !t.completed)
          // .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime())
          .map((task, idx) => (
            <TaskEntry
              key={idx}
              task={task}
              setTask={updateTask.bind(null, idx)}
              checked={tasks[idx].completed}
              setChecked={updateTask.bind(null, idx, {
                completed: !tasks[idx].completed,
              })}
              setDeleted={deleteTask.bind(null, idx)}
            />
          ))
      ) : (
        <p>Looks like you have some free time :)</p>
      )}
    </div>
  );
}
