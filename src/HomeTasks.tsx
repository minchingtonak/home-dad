import { useEffect } from 'react';
import styled from 'styled-components';
import { gapi } from 'gapi-script';
import { useGoogleAPI } from './auth';
import { Task, TaskList } from './config';
import { useCached } from './utils';
import { TasksBar } from './TasksBar';
import { TasksList } from './TasksList';

const TasksMainDiv = styled.div`
  width: var(--section-width);
  height: var(--homesearch-height);

  display: flex;
  flex-direction: column;

  @media screen and (max-width: 608px) {
    & {
      height: min-content;
      margin: 0 0 60px 0;
    }
  }
`;

export default function HomeTasks() {
  const [tasklists, setTaskLists] = useCached<TaskList[]>('tasklists', []);
  const [activeList, setActiveList] = useCached<TaskList>('activelist', {});

  const [tasks, setTasks] = useCached<Task[]>('tasks', []);
  const [completed, setCompleted] = useCached<Task[]>('completed', []);
  const { loggedIn } = useGoogleAPI();

  useEffect(() => {
    setTasks(
      tasks.sort((a, b) =>
        a.position && b.position ? a.position.localeCompare(b.position) : 0,
      ),
    );
  }, [tasks, setTasks]);

  useEffect(() => {
    if (loggedIn)
      try {
        gapi.client.tasks.tasklists
          ?.list()
          .then((data) => {
            if (data.statusText !== 'OK')
              throw Error('failed to get tasklists');
            if (data.result.items) {
              setTaskLists(data.result.items);
              if (activeList.title === undefined)
                setActiveList(data.result.items[0]);
            }
          })
          .catch((err) => {
            console.error(err);
          });
      } catch (err) {
        console.error(err);
      }
  }, [loggedIn, setTaskLists, setActiveList, activeList.title]);

  useEffect(() => {
    if (loggedIn && activeList.id)
      try {
        gapi.client.tasks.tasks
          ?.list({
            tasklist: activeList.id,
            showCompleted: true,
            maxResults: 100,
          })
          .then((data) => {
            if (data.statusText !== 'OK')
              throw Error(`failed to get tasks for list ${activeList.title}`);

            const list = data.result.items || [];
            setTasks(list.filter((elt) => elt.completed === undefined));
            setCompleted(list.filter((elt) => elt.completed));
          })
          .catch((err) => console.error(err));
      } catch (err) {
        console.error(err);
      }
  }, [loggedIn, setTasks, setCompleted, activeList.id, activeList.title]);

  return (
    <TasksMainDiv id="tasksmain">
      <TasksBar
        tasklists={tasklists}
        activeList={activeList}
        setActiveList={setActiveList}
      />
      <TasksList
        tasks={tasks}
        setTasks={setTasks}
        completed={completed}
        setCompleted={setCompleted}
        activeTaskList={activeList}
      />
    </TasksMainDiv>
  );
}
