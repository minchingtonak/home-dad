import {
  NewTask,
  Task,
  TASKS_API_URL,
  TASK_DELETE_DELAY,
  TASK_UPDATE_DELAY,
} from './config';
import update from 'immutability-helper';
import { useCallback, useContext, useEffect, useState } from 'react';
import {
  HomeCheckbox,
  HomeDateTimePicker,
  HomeMaterialInput,
  AddTaskContext,
  partial,
} from './utils';
import styled from 'styled-components';

const TaskEntryDiv = styled.div`
  margin: 0 5px 5px 5px;
  padding: 0 0 10px 0;

  display: flex;
  flex-direction: row;
  align-items: flex-start;

  background-color: var(--hdr);

  color: var(--txt);
`;

const TaskDescInput = styled(HomeMaterialInput)`
  // margin: 10px 10px 10px 7px;

  font-size: large;
`;

const TaskUIDiv = styled.div`
  padding-top: 3px;

  display: flex;
  flex-direction: column;
`;

const TrashIcon = styled.i.attrs({ className: 'far fa-trash-alt fa-lg' })`
  padding: 10px;

  transform: scale(0.96);

  color: var(--htx);
`;

const DueDateDiv = styled.div`
  margin-right: 0;

  display: flex;
  align-content: flex-start;
  align-items: center;
`;

// const DueIcon = styled.i.attrs({ className: 'far fa-clock' })`
//   margin: 5px 5px 5px 0;
//   color: var(--htx);
// `;

const TaskDateTimePicker = styled(HomeDateTimePicker)`
  transform: scale(0.88) translateX(-13px);
`;

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
    <TaskEntryDiv className="taskentry">
      <HomeCheckbox checked={task.completed} onChange={setChecked} />
      <TaskUIDiv>
        <TaskDescInput
          error={task.text === ''}
          value={task.text}
          placeholder="Description cannot be empty"
          onChange={(e) => setTask({ text: e.target.value })}
        />
        <DueDateDiv>
          {/* <DueIcon /> */}
          <TaskDateTimePicker
            variant="inline"
            autoOk
            ampm={false}
            hideTabs={true}
            value={task.due}
            format={'ddd, MMM D [at] H:mm'}
            onChange={(d) => setTask({ due: d?.toDate() })}
          />
        </DueDateDiv>
      </TaskUIDiv>
      <TrashIcon onClick={setDeleted} />
    </TaskEntryDiv>
  );
}

const CompletedTasksDiv = styled.div`
  padding: 5px;
  margin: 0 5px 5px 5px;

  color: var(--htx);

  &:hover {
    color: var(--txt);
    hr {
      background-color: var(--txt);
    }
  }
`;

const StyledHR = styled.hr`
  height: 1px;

  border-width: 0;

  background-color: var(--htx);
`;

type ChevronIconProps = {
  expanded: boolean;
};

const ChevronIcon = styled.i.attrs<ChevronIconProps>(({ expanded }) => ({
  className: `fas fa-chevron-${expanded ? 'down' : 'right'}`,
}))<ChevronIconProps>`
  &.fa-chevron-right {
    margin-right: 7px;
  }

  &.fa-chevron-down {
    margin-right: 3px;
  }
`;

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
      <CompletedTasksDiv
        id="completedtasks"
        onClick={partial(setExpanded, !expanded)}
      >
        <StyledHR />
        <ChevronIcon expanded={expanded} />
        <span>Completed tasks</span>
      </CompletedTasksDiv>
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

const TasksListDiv = styled.div`
  height: 100%;
  width: 100%;
  padding-top: 5px;

  overflow: auto;

  background-color: var(--frg);

  color: var(--htx);
  text-align: center;
`;

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
  const { setAddTask } = useContext(AddTaskContext);

  const addTask = useCallback((task: NewTask) => {
    console.log(`adding ${task}`);
    fetch(TASKS_API_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    })
      .then((res) => res.json())
      .then((task: Task) => {
        setTasks(
          update(tasks, { $push: [task] }).sort(
            (a, b) => new Date(a.due).getTime() - new Date(b.due).getTime(),
          ),
        );
      })
      .catch((e) => console.log(e));
  }, [tasks, setTasks]);

  useEffect(() => {
    setAddTask(addTask);
  }, [addTask, setAddTask]);

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

  const [deleteTimer, setDeleteTimer] = useState<number | undefined>();
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
    <TasksListDiv id="taskslist">
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
    </TasksListDiv>
  );
}
