import { Task } from './config';

// function AddTaskPopup({ addTask }: { addTask: (t: Task) => void }) {

// }

export function TasksBar({ setTasks }: { setTasks: (t: Task[]) => void }) {
  return <div id="tasksbar">Tasks</div>;
}
