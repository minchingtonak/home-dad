import { useEffect, useState } from 'react';
import { Task, TASKS_API_URL } from './config';
import { TasksBar } from './TasksBar';
import { TasksList } from './TasksList';

export function HomeTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completed, setCompleted] = useState<Task[]>([]);

  useEffect(() => {
    fetch(`${TASKS_API_URL}?completed=false`, { method: 'GET' })
      .then((res) => res.json())
      .then((data) => setTasks(data.tasks))
      .catch((e) => console.log(e));
  }, []);

  useEffect(() => {
    fetch(`${TASKS_API_URL}?completed=true`, { method: 'GET' })
      .then((res) => res.json())
      .then((data) => setCompleted(data.tasks))
      .catch((e) => console.log(e));
  }, []);

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
