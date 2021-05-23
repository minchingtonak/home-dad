import styled from 'styled-components';

const TasksBarDiv = styled.div`
  padding: 5px;

  display: flex;
  align-items: center;
  justify-content: flex-start;

  background-color: var(--hdr);

  color: var(--htx);
`;

const TasksBarText = styled.span`
  margin: 0 auto 0 0;
`;

export function TasksBar() {
  return (
    <TasksBarDiv id="tasksbar">
      <TasksBarText>Tasks</TasksBarText>
    </TasksBarDiv>
  );
}
