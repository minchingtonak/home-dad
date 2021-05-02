import { Task } from './config';

export function TasksBar({ setTasks }: { setTasks: (t: Task[]) => void }) {
  return <div id="tasksbar">
    Tasks
  </div>;
}
