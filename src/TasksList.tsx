import {
  Task,
  TASKS_API_URL,
  TASK_DELETE_DELAY,
  TASK_UPDATE_DELAY,
} from './config';
import update from 'immutability-helper';
// import {
//   CheckboxProps,
//   Checkbox,
//   InputProps,
//   Input,
//   ThemeProvider,
//   withStyles,
//   createMuiTheme,
// } from '@material-ui/core';
// import {
//   DateTimePicker,
//   DateTimePickerProps,
//   MuiPickersUtilsProvider,
// } from '@material-ui/pickers';
// import DayJsUtils from '@date-io/dayjs';
import { useState } from 'react';
import { HomeCheckbox, HomeDateTimePicker, HomeInput, partial } from './utils';

function TaskEntry({
  task,
  setTask,
  setChecked,
  setDeleted,
}: {
  task: Task;
  setTask: (t: Partial<Task>) => void;
  setChecked: () => void;
  setDeleted: () => void;
}) {
  return (
    <div className="taskentry">
      <HomeCheckbox checked={task.completed} onChange={setChecked} />
      <div>
        <HomeInput
          error={task.text === ''}
          value={task.text}
          style={{ fontSize: 'large' }}
          onChange={(e) => setTask({ text: e.target.value })}
        />
        <span id="due">
          <i className="far fa-clock"></i>
          <HomeDateTimePicker
            variant="inline"
            autoOk
            ampm={false}
            hideTabs={true}
            value={task.due}
            format={'dddd, MMM D [at] H:mm'}
            onChange={(d) => setTask({ due: d?.toDate() })}
          />
        </span>
      </div>
      <i className="far fa-trash-alt fa-lg" onClick={setDeleted}></i>
    </div>
  );
}

function CompletedTasks({
  tasks,
  setTask,
  setChecked,
  setDeleted,
}: {
  tasks: Task[];
  setTask: (idx: number, t: Partial<Task>) => void;
  setChecked: (idx: number) => void;
  setDeleted: (idx: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div id="completedtasks" onClick={partial(setExpanded, !expanded)}>
        <hr />
        {expanded ? (
          <i className="fas fa-chevron-down" />
        ) : (
          <i className="fas fa-chevron-right" />
        )}
        <span>Completed tasks</span>
      </div>
      {expanded
        ? tasks.map((task, idx) => (
            <TaskEntry
              key={idx}
              task={task}
              setTask={partial(setTask, idx)}
              setChecked={partial(setChecked, idx)}
              setDeleted={partial(setDeleted, idx)}
            />
          ))
        : ''}
    </>
  );
}

export function TasksList({
  tasks,
  setTasks,
  completed: doneTasks,
  setCompleted: setDoneTasks,
}: {
  tasks: Task[];
  setTasks: (t: Task[]) => void;
  completed: Task[];
  setCompleted: (t: Task[]) => void;
}) {
  const [updateTimer, setUpdateTimer] = useState<number | undefined>(undefined);
  const [toBeUpdated, setToBeUpdated] = useState<{
    [k: string]: Partial<Task>;
  }>({});

  function updateTask(
    list: Task[],
    setList: (t: Task[]) => void,
    idx: number,
    t: Partial<Task>,
  ) {
    // update local tasks list
    const updated = update(list, {
      [idx]: { $merge: t },
    });

    setList(updated);
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

  function deleteTask(list: Task[], setList: (t: Task[]) => void, idx: number) {
    const updated = update(list, { $splice: [[idx, 1]] });
    setList(updated);

    const newToDelete = [...toDelete, list[idx]._id];
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

  function toggleCompleted(
    src: Task[],
    setSrc: (t: Task[]) => void,
    dest: Task[],
    setDest: (t: Task[]) => void,
    idx: number,
  ) {
    // remove from src list
    const newSrc = update(src, { $splice: [[idx, 1]] });
    setSrc(newSrc);

    // add to dest list
    const updatedTask = { ...src[idx], completed: !src[idx].completed };
    const newDest = update(dest, {
      $push: [updatedTask],
    }).sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
    setDest(newDest);

    // send patch to server
    fetch(TASKS_API_URL, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        { _id: updatedTask._id, completed: updatedTask.completed },
      ]),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.updated !== 1)
          console.error(`failed to set task ${updatedTask._id}`);
      })
      .catch((e) => console.log(e));
  }

  return (
    <div id="taskslist">
      {tasks.length ? (
        tasks.map((task, idx) => (
          <TaskEntry
            key={idx}
            task={task}
            setTask={partial(updateTask, tasks, setTasks, idx)}
            setChecked={partial(
              toggleCompleted,
              tasks,
              setTasks,
              doneTasks,
              setDoneTasks,
              idx,
            )}
            setDeleted={partial(deleteTask, tasks, setTasks, idx)}
          />
        ))
      ) : (
        <p>Looks like you have some free time :)</p>
      )}
      <CompletedTasks
        tasks={doneTasks}
        setTask={partial(updateTask, doneTasks, setDoneTasks)}
        setChecked={partial(
          toggleCompleted,
          doneTasks,
          setDoneTasks,
          tasks,
          setTasks,
        )}
        setDeleted={partial(deleteTask, doneTasks, setDoneTasks)}
      />
    </div>
  );
}
