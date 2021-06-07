import styled from 'styled-components';
import { TaskList } from './config';
import { useState } from 'react';
import { partial } from './utils';
import { useGoogleAPI } from './auth';

const TasksBarDiv = styled.div`
  padding: 5px;

  height: 20px;

  display: flex;
  align-items: center;
  justify-content: flex-start;

  background-color: var(--hdr);

  color: var(--htx);
`;

const TaskListChooserButton = styled.i.attrs({ className: 'fas fa-bars' })`
  padding: 7px 12px 8px 5px;

  font-size: 1.2em;
  color: var(--frg-l);

  &:hover {
    color: var(--frg-ll);
  }
`;

const TasksBarText = styled.span`
  margin: 0 auto 0 0;
`;

const DropDown = styled.div<{ open: boolean }>`
  max-height: ${(props) => (props.open ? `1000px` : '0')};
  transition: max-height
    ${(props) => (props.open ? '0.35s ease-in' : '0.25s ease-out')};

  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  overflow: auto;
  scrollbar-width: thin;

  background-color: var(--frg);
  color: var(--txt);
`;

const DropDownElement = styled.span`
  padding: 5px;

  &:hover {
    background-color: var(--hdr);
  }
`;

export function TasksBar({
  tasklists,
  activeList,
  setActiveList,
}: {
  tasklists: TaskList[];
  activeList: TaskList;
  setActiveList: (t: TaskList) => void;
}) {
  const [open, setOpen] = useState(false);
  const { loggedIn } = useGoogleAPI();

  return (
    <>
      <TasksBarDiv id="tasksbar">
        {loggedIn ? (
          <TaskListChooserButton onClick={partial(setOpen, !open)} />
        ) : (
          <></>
        )}
        <TasksBarText>
          {loggedIn && activeList.title ? `Tasks - ${activeList.title}` : 'Tasks - Not logged in'}
        </TasksBarText>
      </TasksBarDiv>
      <DropDown open={open}>
        {tasklists.map((list, idx) => (
          <DropDownElement
            key={idx}
            onClick={() => {
              setActiveList(list);
              setOpen(false);
            }}
          >
            {list.title}
          </DropDownElement>
        ))}
      </DropDown>
    </>
  );
}
