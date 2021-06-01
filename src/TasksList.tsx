import { ReactElement, useCallback, useEffect, useState } from 'react';
import update from 'immutability-helper';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { Task, TaskList, TASK_UPDATE_DELAY } from './config';
import {
  HomeCheckbox,
  HomeDatePicker,
  HomeMaterialInput,
  partial,
  useAddTask,
} from './utils';
import { useGoogleAPI } from './auth';

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

  &:hover {
    color: var(--txt);
  }
`;

const DueDateDiv = styled.div`
  margin-right: 0;

  display: flex;
  align-content: flex-start;
  align-items: center;
`;

const DueIcon = styled.i.attrs({ className: 'far fa-clock' })`
  margin: 5px 5px 5px 4px;
  color: var(--htx);
`;

const TaskDatePicker = styled(HomeDatePicker)`
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
      <HomeCheckbox
        checked={task.completed !== undefined}
        onChange={setChecked}
      />
      <TaskUIDiv>
        <TaskDescInput
          value={task.title}
          error={task.title === ''}
          placeholder="Description cannot be empty"
          onChange={(e) => setTask({ title: e.target.value })}
        />
        <DueDateDiv>
          <DueIcon />
          <TaskDatePicker
            variant="inline"
            autoOk
            // IDK why the offset here isn't the same as the native tasks clients
            value={task.due ? dayjs(task.due).add(12, 'hour') : null}
            format={'dddd, MMM D'}
            onAccept={(d) => {
              setTask({ due: d?.toISOString() });
            }}
            onChange={() => {}}
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
  setTask: (taskId: string, idx: number, t: Partial<Task>) => void;
  setChecked: (taskId: string, idx: number) => void;
  setDeleted: (taskId: string, idx: number) => void;
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
              setTask={partial(setTask, task.id as string, idx)}
              setChecked={partial(setChecked, task.id as string, idx)}
              setDeleted={partial(setDeleted, task.id as string, idx)}
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

// type LogoutFailedWarningProps = {
//   failed: boolean;
// };

// const LogoutFailedWarning = styled.span<LogoutFailedWarningProps>`
//   margin: 0 0 5px 0;

//   display: ${(props) => (props.failed ? 'inherit' : 'none')};

//   color: red;
//   font-size: 0.8em;
// `;

const NoTasksText = styled.p`
  margin: 20px 5px;
`;

export function TasksList({
  tasks,
  setTasks,
  completed: doneTasks,
  setCompleted: setDoneTasks,
  activeTaskList,
}: {
  tasks: Task[];
  setTasks: (t: Task[]) => void;
  completed: Task[];
  setCompleted: (t: Task[]) => void;
  activeTaskList: TaskList;
}) {
  const { setAddTask } = useAddTask();
  const { loggedIn, username } = useGoogleAPI();

  const addTask = useCallback(
    (task: Task) => {
      try {
        gapi.client.tasks.tasks
          ?.insert({ resource: task, tasklist: activeTaskList.id as string })
          .then((data) => {
            if (data.statusText !== 'OK') throw Error('failed to add task');
            setTasks(update(tasks, { $push: [data.result] }));
          })
          .catch((err) => console.error(err));
      } catch (err) {
        console.error(err);
      }
    },
    [tasks, setTasks, activeTaskList.id],
  );

  useEffect(() => {
    setAddTask(addTask);
  }, [addTask, setAddTask]);

  const [updateTimers, setUpdateTimers] = useState<{ [k: string]: number }>({});

  function updateTask(
    list: Task[],
    setList: (t: Task[]) => void,
    listId: string,
    taskId: string,
    idx: number,
    task: Partial<Task>,
  ) {
    // update local tasks list
    const updated = update(list, {
      [idx]: { $merge: task },
    });
    setList(updated);

    // check if timer for this task id is already in updateTimers
    const oldTaskTimer = updateTimers[taskId];
    if (oldTaskTimer !== undefined)
      // if it is, cancel it
      clearTimeout(oldTaskTimer);

    if (task.title === '') return;

    // schedule a new update
    const newTaskTimer = window.setTimeout(() => {
      gapi.client.tasks.tasks
        ?.patch({ resource: task, tasklist: listId, task: taskId })
        .then((data) => {
          if (data.statusText !== 'OK')
            throw Error(`failed to update task ${listId} : ${taskId}`);
          // clear this task's timer
          setUpdateTimers(update(updateTimers, { $unset: [taskId] }));
        })
        .catch((err) => console.error(err));
    }, TASK_UPDATE_DELAY);

    setUpdateTimers(
      update(updateTimers, { $merge: { [taskId]: newTaskTimer } }),
    );
  }

  function deleteTask(
    list: Task[],
    setList: (t: Task[]) => void,
    listId: string,
    taskId: string,
    idx: number,
  ) {
    // delete the task
    // console.log(gapi.client.tasks.tasks);
    // console.log(gapi.client.tasks.tasklists);
    try {
      gapi.client.tasks.tasks
        ?.delete({ tasklist: listId, task: taskId })
        .then((data) => {
          if (data.status !== 204)
            throw Error(`failed to delete task ${listId} : ${taskId}`);

          // update local copy
          setList(update(list, { $splice: [[idx, 1]] }));
        })
        .catch((err) => console.error(err));
    } catch (err) {
      console.error(err);
    }
  }

  function toggleCompleted(
    src: Task[],
    setSrc: (t: Task[]) => void,
    dest: Task[],
    setDest: (t: Task[]) => void,
    listId: string,
    taskId: string,
    idx: number,
  ) {
    // assemble updated task
    const oldTask = src[idx];
    const query = {
      status: oldTask.status === 'completed' ? 'needsAction' : 'completed',
    };

    // send update
    gapi.client.tasks.tasks
      ?.patch({ resource: query, tasklist: listId, task: taskId })
      .then((data) => {
        if (data.statusText !== 'OK')
          throw Error(`failed to toggle task completed ${listId} : ${taskId}`);

        // remove from src list
        const newSrc = update(src, { $splice: [[idx, 1]] });
        setSrc(newSrc);

        // add to dest list
        const newDest = update(dest, {
          $push: [
            update(
              // update status, remove completed field if necessary
              oldTask,
              oldTask.status === 'completed'
                ? { $unset: ['completed'], $merge: { status: 'needsAction' } }
                : { $merge: { status: 'completed' } },
            ),
          ],
        });
        setDest(newDest);
      });
  }

  let body: ReactElement;
  if (loggedIn) {
    body = (
      <>
        {tasks.length ? (
          tasks.map((task, idx) => (
            <TaskEntry
              key={idx}
              task={task}
              setTask={partial(
                updateTask,
                tasks,
                setTasks,
                activeTaskList.id as string,
                task.id as string,
                idx,
              )}
              setChecked={partial(
                toggleCompleted,
                tasks,
                setTasks,
                doneTasks,
                setDoneTasks,
                activeTaskList.id as string,
                task.id as string,
                idx,
              )}
              setDeleted={partial(
                deleteTask,
                tasks,
                setTasks,
                activeTaskList.id as string,
                task.id as string,
                idx,
              )}
            />
          ))
        ) : (
          <NoTasksText>
            Looks like you have some free time, {username} :)
          </NoTasksText>
        )}
        <CompletedTasks
          tasks={doneTasks}
          setTask={partial(
            updateTask,
            doneTasks,
            setDoneTasks,
            activeTaskList.id as string,
          )}
          setChecked={partial(
            toggleCompleted,
            doneTasks,
            setDoneTasks,
            tasks,
            setTasks,
            activeTaskList.id as string,
          )}
          setDeleted={partial(
            deleteTask,
            doneTasks,
            setDoneTasks,
            activeTaskList.id as string,
          )}
        />
      </>
    );
  } else {
    body = <p>Use /login to log into Tasks</p>;
  }

  return <TasksListDiv id="taskslist">{body}</TasksListDiv>;
}
