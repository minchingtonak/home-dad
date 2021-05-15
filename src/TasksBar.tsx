import { Task } from './config';
import styled from "styled-components";

// function AddTaskPopup({ addTask }: { addTask: (t: Task) => void }) {

// }

const TasksBarDiv = styled.div`
  padding: 5px;

  display: flex;
  align-items: center;

  background-color: var(--hdr);

  color: var(--htx);
  font-size: 30px;
`;

export function TasksBar({ setTasks }: { setTasks: (t: Task[]) => void }) {
  return <TasksBarDiv id="tasksbar">Tasks</TasksBarDiv>;
}
