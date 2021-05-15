import { useEffect } from 'react';
import { Task, TASKS_API_URL } from './config';
import { TasksBar } from './TasksBar';
import { TasksList } from './TasksList';
import { useCached } from './utils';

export function HomeTasks() {
  const [tasks, setTasks] = useCached<Task[]>('tasks', []);
  const [completed, setCompleted] = useCached<Task[]>('completed', []);

  useEffect(() => {
    fetch(`${TASKS_API_URL}?completed=false`, { method: 'GET' })
      .then((res) => res.json())
      .then((data) => setTasks(data.tasks))
      .catch((e) => console.log(e));
  }, [setTasks]);

  useEffect(() => {
    fetch(`${TASKS_API_URL}?completed=true`, { method: 'GET' })
      .then((res) => res.json())
      .then((data) => setCompleted(data.tasks))
      .catch((e) => console.log(e));
  }, [setCompleted]);

  return (
    <div id="tasksmain">
      <TasksBar setTasks={setTasks} />
      <TasksList
        tasks={tasks}
        setTasks={setTasks}
        completed={completed}
        setCompleted={setCompleted}
      />
    </div>
  );
}
