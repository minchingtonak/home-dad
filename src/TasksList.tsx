import { ReactElement, useCallback, useEffect, useState } from 'react';
import update from 'immutability-helper';
import styled from 'styled-components';
import { TaskEntry } from './TaskEntry';
import { Task, TaskList, TASK_UPDATE_DELAY } from './config';
import { partial, useAddTask } from './utils';
import { useGoogleAPI } from './auth';

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

  overflow: hidden scroll;
  scrollbar-width: thin;

  background-color: var(--frg);

  color: var(--htx);
  text-align: center;
`;

const NoTasksText = styled.p`
  margin: 20px 80px;
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
    body = <NoTasksText>Use /login to log into Tasks</NoTasksText>;
  }

  return <TasksListDiv id="taskslist">{body}</TasksListDiv>;
}
