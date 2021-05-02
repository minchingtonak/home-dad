import {
  Task,
  TaskOptions,
  TASKS_API_URL,
  TASK_DELETE_DELAY,
  TASK_UPDATE_DELAY,
} from './config';
import update from 'immutability-helper';
import { ChangeEventHandler, useEffect, useState } from 'react';
import 'react-modern-calendar-datepicker/lib/DatePicker.css';
import DatePicker, { Day, DayValue } from 'react-modern-calendar-datepicker';
import dayjs from 'dayjs';

function TaskEntry({
  task,
  setTask,
  checked,
  setChecked,
  setDeleted,
}: {
  task: Task;
  setTask: (t: TaskOptions) => void;
  checked: boolean;
  setChecked: ChangeEventHandler;
  setDeleted: () => void;
}) {
  const [day, setDay] = useState<DayValue>(null);

  useEffect(() => {
    const d = new Date(task.due);
    setDay({ year: d.getFullYear(), month: d.getMonth(), day: d.getDate() });
  }, [task]);

  function toDate(d: Day, t: number) {
    return new Date(d.year, d.month - 1, d.day);
  }

  return (
    <div>
      <input type="checkbox" checked={checked} onChange={setChecked} />
      <div>
        <input
          id="desc"
          value={task.text}
          onChange={(e) => {
            setTask({ text: e.target.value });
          }}
        />
        <span id="due">
          <i className="fas fa-clock"></i>
          <input
            readOnly
            className="date-picker-input"
            value={
              day
                ? dayjs(toDate(day, 0)).format('ddd, MMM D [at H:mm]')
                : 'choose a date'
            }
          />
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
  const [toBeUpdated, setToBeUpdated] = useState<{ [k: string]: TaskOptions }>(
    {},
  );

  function updateTask(idx: number, t: TaskOptions) {
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
        tasks.map((task, idx) => (
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
